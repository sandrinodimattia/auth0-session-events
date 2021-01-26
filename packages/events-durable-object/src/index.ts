/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleErrors, getPath, jsonResponse, wsResponse } from '@a0-events/common';

import parse from './lib/parsers';

interface Session {
  quit: boolean;
  connected: Date;
  webSocket: any;
  sub?: string;
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
      switch (path) {
        case '/api/listeners':
          return jsonResponse(200, {
            count: this.sessions.length,
            connections: this.sessions
              .filter((s) => !s.quit)
              .map((s) => ({
                connected_on: s.connected,
                sub: s.sub
              }))
          });
        case '/api/subscribe':
          return this.subscribe(request);
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
   * @param request Request
   */
  async subscribe(request: Request): Promise<Response> {
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
            const claims = await this.authorize('https://sandrino-dev.auth0.com/', accessToken);
            session.sub = claims.sub as string;

            // Notify the client that the authentication succeeded.
            serverSocket.send(
              JSON.stringify({
                type: 'authenticated',
                sub: session.sub,
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

  async broadcast(request: Request): Promise<Response> {
    const body = await request.json();
    const events = await body.map((e: any) => parse(e)).filter((e: any) => e != null);

    const jsonEvents = events.map((e: any) => JSON.stringify(e));

    this.sessions = this.sessions.filter((session) => {
      try {
        // Only send events to authenticated sockets.
        if (session.sub) {
          jsonEvents.forEach((e: any) => session.webSocket.send(e));
        }
        return true;
      } catch (err) {
        // eslint-disable-next-line no-param-reassign
        session.quit = true;
        return false;
      }
    });

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
