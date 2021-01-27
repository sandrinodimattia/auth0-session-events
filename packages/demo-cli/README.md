# Demo CLI

## Auth0 Configuration

In order to test this CLI you'll want to create a Machine to Machine application in the [dashboard](https://manage.auth0.com/):

1. Give the client a name, eg: "Acme Backend"
2. Enable the application for your "Auth0 Events API" and configure the `listen:events` scope
3. Take note of the **Auth0 Domain**, the **Auth0 Client ID** and **Auth0 Client Secret**

## Running the application

A sample CLI which can receive user events.

Create a config file with the information from your client:

```dotenv
AUTH0_EVENTS_DOMAIN=events.auth0a.com/sandrino-dev
AUTH0_DOMAIN=sandrino-dev.auth0.com
AUTH0_CLIENT_ID=VMeuuCMWfzcVQ1iPx6NxdBKppjafWktA
AUTH0_CLIENT_SECRET=...
```

> Note that the `AUTH0_EVENTS_DOMAIN` follows a specific structure. Read more about it in the main [README.md](../../README.md)

Then run the application:

```bash
npm install
npm start
```

The application will connect to the stream and start receiving events for all users in a given tenant:

```
DEBUG    [2021-01-27 10:51:10.667 +0000]: Authenticating client VMeuuCMWfzcVQ1iPx6NxdBKppjafWktA to sandrino-dev.auth0.com
DEBUG    [2021-01-27 10:51:11.984 +0000]: Initializing connection to wss://events.auth0a.com/sandrino-dev/api/subscribe
DEBUG    [2021-01-27 10:51:12.196 +0000]: Connected to the stream
INFO     [2021-01-27 10:51:12.198 +0000]: An message was received
    type: "connected"
INFO     [2021-01-27 10:51:12.319 +0000]: An message was received
    type: "authenticated"
    sub: "VMeuuCMWfzcVQ1iPx6NxdBKppjafWktA@clients"
    filter: "*"
    claims: {
      "iss": "https://sandrino-dev.auth0.com/",
      "sub": "VMeuuCMWfzcVQ1iPx6NxdBKppjafWktA@clients",
      "aud": "https://events.auth0a.com/api",
      "iat": 1611744671,
      "exp": 1611831071,
      "azp": "VMeuuCMWfzcVQ1iPx6NxdBKppjafWktA",
      "scope": "listen:events",
      "gty": "client-credentials"
    }
DEBUG    [2021-01-27 10:51:22.200 +0000]: Sending ping
DEBUG    [2021-01-27 10:51:22.418 +0000]: Pong received
DEBUG    [2021-01-27 10:51:32.202 +0000]: Sending ping
```
