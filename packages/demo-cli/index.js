require('dotenv').config();
const logger = require('./lib/logger');
const Auth0Listener = require('./lib/listener');

const listener = new Auth0Listener(process.env.AUTH0_DOMAIN, logger);
listener.on('error', (err) => {
  logger.error(err, 'An error occured');
});
listener.on('message', (msg) => {
  logger.info(msg, 'An message was received');
});
listener.on('connected', () => {
  const token = '...';
  listener.authenticate(token);
});
listener.connect();
