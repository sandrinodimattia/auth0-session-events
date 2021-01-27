require('dotenv').config();
const logger = require('./lib/logger');
const Auth0Listener = require('./lib/listener');
const { AuthenticationClient } = require('auth0');

const run = async () => {
  logger.debug(`Authenticating client ${process.env.AUTH0_CLIENT_ID} to ${process.env.AUTH0_DOMAIN}`);

  // Authenticate.
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
  const listener = new Auth0Listener(process.env.AUTH0_EVENTS_DOMAIN, logger);
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
};

run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
