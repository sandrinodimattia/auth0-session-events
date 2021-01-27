import { Event } from './lib/types';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleErrors, getPath, jsonResponse, wsResponse } from '@a0-events/common';

import parse from './lib/parsers';

interface Session {
  quit: boolean;
  connected: Date;
  webSocket: any;
  sub?: string;
  filter?: string;
}

export class EventSubscribersDurableObject {
  //private env: WorkerEnvironment;

  /**
   * Our connected sessions.
   */
  private sessions: Array<Session>;

  constructor(/*controller: DurableObjectState /*, env: WorkerEnvironment */) {
    // this.env = env;
    this.sessions = [];
  }

  fetch(request: Request): Promise<Response> {
    return handleErrors(request, async () => {
      const path = getPath(request.url);
      const tenantDomain = request.headers.get('x-tenant-domain');
      if (!tenantDomain) {
        return jsonResponse(404, {
          error: 'not_found',
          error_description: `The tenant domain is missing`
        });
      }

      switch (path) {
        case '/api/_debug':
          return jsonResponse(200, {
            host: request.headers.get('host'),
            url: request.url,
            path,
            tenant_domain: tenantDomain
          });
        case '/api/listeners':
          return jsonResponse(200, {
            count: this.sessions.length,
            connections: this.sessions
              .filter((s) => !s.quit)
              .map((s) => ({
                connected_on: s.connected,
                sub: s.sub,
                filter: s.filter,
                terminated: s.quit
              }))
          });
        case '/api/subscribe':
          return this.subscribe(tenantDomain, request);
        case '/api/publish':
          return this.broadcast(request);
        default:
          return jsonResponse(404, {
            error: 'not_found',
            error_description: `The path ${path} was not found`
          });
      }
    });
  }

  /**
   * Authorize the request.
   * HACK: We need to call an other worker until we can bundle this logic in a Durable Object.
   * @param issuer
   * @param accessToken
   */
  async authorize(issuer: string, accessToken: string): Promise<any> {
    const response = await fetch('https://jwt-authorizer.auth0-testing.workers.dev/', {
      body: JSON.stringify({
        issuer,
        access_token: accessToken
      }),
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      }
    });

    const body = await response.json();
    if (response.status !== 200) {
      throw new Error(body.error_description || 'Unknown error occured while authorizing the request');
    }

    return body;
  }

  /**
   * Accept the websocket request from any client that wishes to subscribe.
   * @param tenantDomain string
   * @param request Request
   */
  async subscribe(tenantDomain: string, request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return jsonResponse(404, {
        error: 'bad_request',
        error_description: `Expected a Websocket request`
      });
    }

    const pair = new WebSocketPair();

    // Accept the incoming request and send a connected message.
    const serverSocket = pair[1];
    serverSocket.accept();
    serverSocket.send(
      JSON.stringify({
        type: 'connected'
      })
    );

    // Create our session and add it to the sessions list.
    const session: Session = {
      webSocket: serverSocket,
      connected: new Date(),
      quit: false
    };
    this.sessions.push(session);

    // Reply to ping messages.
    serverSocket.addEventListener('ping', async () => {
      serverSocket.pong();
    });

    // Listen to incoming messages from this socket.
    serverSocket.addEventListener('message', async (msg: any) => {
      try {
        if (session.quit) {
          serverSocket.close(1011, 'WebSocket broken.');
          return;
        }

        const data = JSON.parse(msg.data);
        if (data && data.type === 'authenticate') {
          try {
            // Authorize the request.
            const accessToken = data.access_token;
            const claims = await this.authorize(`https://${tenantDomain}/`, accessToken);
            if (!claims.scope) {
              throw new Error('The provided token does not contain any scopes');
            }

            // Right scopes are required.
            const scopes = claims.scope.split(' ');
            if (scopes.indexOf('listen:events:self') > -1) {
              session.filter = 'self';
            } else if (scopes.indexOf('listen:events') > -1) {
              session.filter = '*';
            } else {
              throw new Error('The provided token cannot be used to listen for events');
            }

            // The user is now authenticated.
            session.sub = claims.sub as string;

            // Notify the client that the authentication succeeded.
            serverSocket.send(
              JSON.stringify({
                type: 'authenticated',
                sub: session.sub,
                filter: session.filter,
                claims
              })
            );
          } catch (err) {
            serverSocket.quit = true;
            serverSocket.send(
              JSON.stringify({
                type: 'authentication_failed',
                error: err.code,
                error_description: err.message
              })
            );
            serverSocket.close(1009, err.message);
          }
        }
      } catch (err) {
        // Report any exceptions directly back to the client. As with our handleErrors() this
        // probably isn't what you'd want to do in production, but it's convenient when testing.
        serverSocket.send(JSON.stringify({ error: err.stack }));
      }
    });

    // On "close" and "error" events, remove the WebSocket from the sessions list.
    const closeOrErrorHandler = () => {
      session.quit = true;
      this.sessions = this.sessions.filter((member) => member !== session);
    };
    serverSocket.addEventListener('close', closeOrErrorHandler);
    serverSocket.addEventListener('error', closeOrErrorHandler);

    const clientSocket = pair[0];
    return wsResponse(clientSocket);
  }

  /**
   * Broadcast events to all consumers.
   * @param request
   */
  async broadcast(request: Request): Promise<Response> {
    const body = await request.json();
    const events = await body.map((e: any) => parse(e)).filter((e: Event) => e != null);

    // Send events to appropriate listeners.
    events.forEach((event: Event) => {
      const jsonEvent = JSON.stringify(event);
      this.sessions.forEach((session: Session) => {
        try {
          // Send to listeners that are allowed to receive all messages.
          if (session.sub && session.filter === '*') {
            session.webSocket.send(jsonEvent);
          } else if (session.sub && session.filter === 'self' && session.sub === event.user_id) {
            // Send to listeners that are allowed to receive messages for their current user.
            session.webSocket.send(jsonEvent);
          }
        } catch (err) {
          // eslint-disable-next-line no-param-reassign
          session.quit = true;
        }
      });
    });

    // Filter out dead sessions.
    this.sessions = this.sessions.filter((session) => !session.quit);

    // Return the list of events we parsed.
    return jsonResponse(200, { received: body.length, events });
  }
}

/**
 * Dummy object required to deploy the Durable object.
 */
export default {
  fetch(): Response {
    return new Response();
  }
};
