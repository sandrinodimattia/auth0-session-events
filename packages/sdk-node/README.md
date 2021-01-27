# `@a0-events/sdk-node`

A Node.js SDK to receive Auth0 events in realtime.

## Usage

```js
const { AuthenticationClient } = require('auth0');
const Auth0EventsClient = require('@a0-events/sdk-node');

// Get a token to authenticate to the stream.
const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET
});
const { access_token } = await auth0.clientCredentialsGrant({
  audience: 'https://events.auth0a.com/api',
  scope: 'listen:events'
});

// Connect to the stream.
const listener = new Auth0EventsClient('events.auth0a.com/sandrino-dev', logger);
listener.on('error', (err) => {
  logger.error(err, 'An error occured');
});
listener.on('message', (msg) => {
  logger.info(msg, 'An message was received');
});
listener.on('connected', () => {
  listener.authenticate(access_token);
});
listener.connect();
```

## Demo

A demo application with all of the necessary configuration steps can be found here: [demo-cli](../demo-cli)
