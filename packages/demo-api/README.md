# Demo API

A demo API which can subscribe to Auth0 user events in real time. The `@a0-events/sdk-express` middleware will keep track of those events and build up a revocation list, allowing access_tokens to be revoked in real time.

This means that when a user is blocked, the API will be alerted of that and will reject any token from that user which was issued before the blocked event - even if the token is still valid.

## Getting Started

### Defining an API

Start by creating a new API in the Auth0 Dashboard:

- Name: **Timesheets API**
- Identifier: **https://timesheets-api.herokuapp.com/** (can be anything)

### Create an application

You'll want to create a Machine to Machine application in the [dashboard](https://manage.auth0.com/) so the `@a0-events/sdk-express` can connect to the stream.

1. Give the client a name, eg: "Timesheets Backend"
2. Enable the application for your "Auth0 Events API" and configure the `listen:events` scope
3. Take note of the **Auth0 Domain**, the **Auth0 Client ID** and **Auth0 Client Secret**

## Running the API

A sample CLI which can receive user events.

Create a config file with the information from your client:

```dotenv
AUTH0_EVENTS_DOMAIN=events.auth0a.com/sandrino-dev
AUTH0_DOMAIN=sandrino-dev.auth0.com
AUTH0_CLIENT_ID=VMeuuCMWfzcVQ1iPx6NxdBKppjafWktA
AUTH0_CLIENT_SECRET=...
AUTH0_API_IDENTIFIER=https://timesheets-api.herokuapp.com/
```

Make sure you first complete the initial bootstrapping of repository by running this in the root:

```bash
npm install -g lerna
lerna bootstrap
```

Then install all of the dependencies in this package and run the API:

```
yarn install
yarn start
```

> As you start the process your API will also receive the last 100 events that have been sent. This is useful in cases where your APIs might autoscale and new instances come and go which need to rebuild the revocation list.

## Testing Revocation

So first you'll want to receive a token for a given user (eg: quickly get one through ROPG). Call the API:

```bash
curl --request GET \
  --url http://localhost:3001/api/timesheets \
  --header 'Authorization: Bearer eyJhbGciOiJS..'
```

All should be well. Now go ahead and block that user in the Auth0 dashboard and wait for the event to arrive in your API (check the logs) and make that same call.

This should now return an error:

```json
{
  "error": "unauthorized",
  "error_description": "Token rejected due to revocation event: 2021-01-27T14:55:03.667Z/user_blocked"
}
```
