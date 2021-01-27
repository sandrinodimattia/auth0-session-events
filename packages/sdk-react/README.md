# `@a0-events/sdk-react`

A Node.js SDK to receive Auth0 events in realtime in the browser.

> Note: This SDK will probably need to be implemented as a Provider/Context instead of simply doing a hook so we can share state across pages.

## Usage

Simply add the following code to your React application:

```javascript
import useAuth0Events from '@a0-events/sdk-react';

export default function Home() {
  const { connectionStatus, lastJsonMessage } = useAuth0Events('events.auth0a.com/sandrino-dev');

  return (
    <Layout>
      <span>
        The stream is currently <strong>{connectionStatus}</strong> and here is the last message we received:
      </span>
      <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
    </Layout>
  );
}
```

When a `logout` or `user_blocked` event is received we will automatically sign out the user.

> Note: Since Auth0 `id_tokens` don't contain any session information today it's not possible to correlate the session ID from a logout event to the current session. As a result this means that a logout in one browser will also sign you out from your other browsers.

Under the covers this will use the "Auth0 Events API" to authenticate with the stream. Make sure that API is created first before testing this: [instructions](https://github.com/sandrinodimattia/auth0-session-events#defining-an-api).
