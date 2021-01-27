'use strict';

const { compareAsc, parseISO } = require('date-fns');
const { AuthenticationClient } = require('auth0');
const Auth0EventsClient = require('@a0-events/sdk-node');

module.exports = async (options, logger) => {
  // Get a token to authenticate to the stream.
  const auth0 = new AuthenticationClient({
    domain: options.domain,
    clientId: options.clientId,
    clientSecret: options.clientSecret
  });
  const { access_token } = await auth0.clientCredentialsGrant({
    audience: 'https://events.auth0a.com/api',
    scope: 'listen:events'
  });

  const events = [];

  // Connect to the stream.
  const listener = new Auth0EventsClient(options.eventsDomain, logger);
  listener.on('error', (err) => {
    if (logger) {
      logger.error(err, 'An error occured');
    }
  });
  listener.on('message', (msg) => {
    if (logger) {
      logger.debug(msg, 'An message was received');
    }

    if (msg.user_id) {
      const { user_id, type, date, session_id } = msg;
      if (!events[user_id]) {
        events[user_id] = [];
      }

      events[user_id].push({
        type,
        date,
        session_id
      });

      if (logger) {
        logger.debug({ type, date, session_id }, `Add to revocation list for user ${user_id}`);
      }
    }
  });
  listener.on('connected', () => {
    listener.authenticate(access_token);
  });
  listener.connect();

  return function (req, res, next) {
    if (req.user) {
      const revocationList = events[req.user.sub];
      if (revocationList) {
        const tokenIssuedAt = new Date(req.user.iat * 1000);
        const match = revocationList.find((userEvent) => compareAsc(parseISO(userEvent.date), tokenIssuedAt) === 1);
        if (match) {
          if (logger) {
            logger.info(match, 'Revocation list match');
          }

          const err = new Error(
            `Token rejected due to revocation event: ${[match.date, match.type, match.session_id]
              .filter((f) => f)
              .join('/')}`
          );
          err.code = 'unauthorized';
          err.status = 401;
          return next(err);
        }
      }
    }
    next();
  };
};
