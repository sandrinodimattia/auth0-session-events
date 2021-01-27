const app = require('express')();
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const createRevocationList = require('@a0-events/sdk-express');

const logger = require('./lib/logger');

// Load settings from the .env file
dotenv.config();

// Allow all cors, not recommended for production.
app.use(cors());

// Run.
const run = async () => {
  // Authentication middleware.
  const requireAuth = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    algorithms: ['RS256'],
    audience: 'https://events.auth0a.com/api', // process.env.AUTH0_API_IDENTIFIER,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`
  });

  // Revocation list.
  const revoke = await createRevocationList(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      eventsDomain: process.env.AUTH0_EVENTS_DOMAIN
    },
    logger
  );

  // Simple request logger.
  app.use((req, res, next) => {
    logger.info({ url: req.url }, 'New request');
    next();
  });

  app.get('/api/timesheets', requireAuth, revoke, (req, res) => {
    res.send([
      { date: '2020101-03', title: 'My January timesheet' },
      { date: '2020-12-07', title: 'My December timesheet' }
    ]);
  });

  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      error: err.code || 'server_error',
      error_description: err.message
    });
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Timesheets API listening on http://localhost:${port}`));
};

// Start the API.
run().catch((e) => {
  logger.error(e);
  process.exit(1);
});
