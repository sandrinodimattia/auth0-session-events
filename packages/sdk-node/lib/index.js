const WebSocket = require('ws');
const EventEmitter = require('events');

module.exports = class Auth0Listener extends EventEmitter {
  constructor(domain, logger) {
    super();
    this.pingInterval = 10000;
    this.connected = false;
    this.domain = domain;
    this.logger = logger || {
      debug: () => {},
      info: () => {},
      error: () => {}
    };
  }

  heartbeat() {
    if (this.terminateTimeout) {
      clearTimeout(this.terminateTimeout);
    }

    this.terminateTimeout = setTimeout(() => {
      this.emit('error', new Error('No pong event received from server'));
      this.client.terminate();
    }, this.pingInterval + 1000);
  }

  ping() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }

    this.pingTimeout = setTimeout(() => {
      this.logger.debug('Sending ping');
      this.client.ping();
      this.ping();
    }, this.pingInterval);
  }

  raiseError(err) {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }

    this.emit('error', err);
  }

  authenticate(jwt) {
    this.client.send(
      JSON.stringify({
        type: 'authenticate',
        access_token: jwt
      })
    );
  }

  connect() {
    const socketUrl = `wss://${this.domain}/api/subscribe`;
    this.client = new WebSocket(socketUrl);
    this.logger.debug(`Initializing connection to ${socketUrl}`);

    this.client.on('open', () => {
      this.connected = true;
      this.logger.debug('Connected to the stream');
      this.ping();
    });
    this.client.on('open', () => this.heartbeat());
    this.client.on('pong', () => this.logger.debug('Pong received'));
    this.client.on('pong', () => this.heartbeat());
    this.client.on('close', (closeReason) => {
      if (this.pingTimeout) {
        clearTimeout(this.pingTimeout);
      }
      this.logger.debug(`Connection closed: ${closeReason}`);
      this.emit('close');
    });
    this.client.on('error', (err) => {
      console.error('error', err);
      this.raiseError(err || new Error('An unknown websocket error occured'));
    });

    // Handle messages.
    this.client.on('message', () => this.heartbeat());
    this.client.on('message', (message) => {
      const msg = JSON.parse(message);
      if (msg.error) {
        this.raiseError(new Error(msg.error));
      } else {
        this.emit('message', msg);
        if (msg.type === 'connected') {
          this.emit('connected');
        }
      }
    });
  }
};
