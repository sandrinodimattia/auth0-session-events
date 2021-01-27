# `@a0-events/sdk-express`

A Express.js SDK to receive Auth0 events in realtime and use this information to build a revocation list and revoke JWT tokens in real time.

## Usage

```js
const createRevocationList = require('@a0-events/sdk-express');

// Some middleware which takes care of JWT authorization (express-jwt)
const requireAuth = ...

// Revocation list middleware
const revoke = await createRevocationList(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    eventsDomain: process.env.AUTH0_EVENTS_DOMAIN
  },
  logger
);

app.get('/api/timesheets', requireAuth, revoke, (req, res) => {
  res.send([
    { date: '2020101-03', title: 'My January timesheet' },
    { date: '2020-12-07', title: 'My December timesheet' }
  ]);
});
```

## Demo

A demo application with all of the necessary configuration steps can be found here: [demo-api](../demo-api)
