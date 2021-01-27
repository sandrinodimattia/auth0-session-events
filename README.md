# @a0-events

Using Cloudflare Durable Objects we now have the ability to notify browsers and backend about changes to a user's session. This will allow us to implement Single Sign Out, Token Revocation and more...

## Getting started

### Connecting your Log Stream

As a first step we want to send all of the Auth0 audit logs to our event publisher. In the [Auth0 Dashboard](https://manage.auth0.com/) under Log Streaming go ahead and create a new **Custom Webhook** stream with the following settings:

- Name: **Auth0 Events**
- Payload URL: **https://events.auth0a.com/{YOUR_TENANT}/api/publish**
- Content Type: `application/json`
- Content Format: **JSON Array**

The tenant in the payload URL depends on your actual Auth0 domain and locality. Here are the 5 different options you can use:

| Domain                | Payload URL                                       |
| --------------------- | ------------------------------------------------- |
| sandrino.auth0.com    | https://events.auth0a.com/sandrino/api/publish    |
| sandrino.us.auth0.com | https://events.auth0a.com/sandrino@us/api/publish |
| sandrino.eu.auth0.com | https://events.auth0a.com/sandrino@eu/api/publish |
| sandrino.au.auth0.com | https://events.auth0a.com/sandrino@au/api/publish |
| sandrino.jp.auth0.com | https://events.auth0a.com/sandrino@jp/api/publish |

> Note: The payload URL currently does not require any form of authorization. That's something we'll want to add later.

That's all there is to it to start publishing events.

### Defining an API

In order to receive events our clients (browsers, backends) will need to connect to the stream but they'll also need to authenticate. Start by creating a new API in the Auth0 Dashboard:

- Name: **Auth0 Events API**
- Identifier: **https://events.auth0a.com/api**
- Permissions: `listen:events:self` and `listen:events`

### Sample CLI

A first demo we have is a sample CLI which connects to the stream and displays the events.

Follow [the steps described here](./packages/demo-cli/README.md) to run the CLI demo.

> Note that we currently only watch the `user_blocked` and `logout` events.

### API Endpoints

Call the Cloudflare Worker and get back some helpful information:

```bash
curl https://events.auth0a.com/sandrino-dev/_debug | jq
```

Call the Durable Object for my tenant and get back some helpful information:

```bash
curl https://events.auth0a.com/sandrino-dev/api/_debug | jq
```

Publish events to all listeners (used by Log Streaming)

```bash
curl https://events.auth0a.com/sandrino-dev/api/publish | jq
```

> Note: This endpoint should require authentication in the future.

Connect to the stream to receive events:

```bash
curl https://events.auth0a.com/sandrino-dev/api/subscribe | jq
```

> Note: After connecting you'll need to send a `{ "type": "authenticate", "access_token": "..." }` message to be authenticated. Only then will you receive events ([example](https://github.com/sandrinodimattia/auth0-session-events/blob/master/packages/demo-cli/lib/listener.js#L49-L54)).

Get a list of all listeners currently connected to the stream:

```bash
curl https://events.auth0a.com/sandrino-dev/api/listeners | jq
```

> Note: This endpoint should require authentication in the future.

Get the last 100 events which have been published:

```bash
curl https://events.auth0a.com/sandrino-dev/api/events | jq
```

> Note: This endpoint should require authentication in the future.

## Commands

Install all dependencies:

```bash
npm install -g lerna
lerna bootstrap
```

Build all projects:

```bash
yarn run build
```
