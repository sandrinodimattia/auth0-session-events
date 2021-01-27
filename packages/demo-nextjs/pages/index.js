import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import Layout from '../components/layout';

export default function Home() {
  const [authenticating, setAuthenticating] = useState(false);
  const [socketUrl, setSocketUrl] = useState('wss://events.auth0a.com/sandrino-dev/api/subscribe');
  const { user, error, isLoading, logout, getAccessTokenSilently } = useAuth0();
  const { sendMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onMessage: (e) => {
      const msg = JSON.parse(e.data);
      console.log('message received', msg);
      if (msg.type === 'authenticated') {
        setAuthenticating(false);
      } else if (msg.type === 'logout') {
        logout({ returnTo: window.location.origin });
      }
    }
  });

  useEffect(() => {
    if (user && !isLoading && !authenticating && lastJsonMessage && lastJsonMessage.type === 'connected') {
      console.log('starting authentication...');
      setAuthenticating(true);
      (async () => {
        try {
          console.log('getting token');
          const token = await getAccessTokenSilently({
            audience: process.env.NEXT_PUBLIC_AUDIENCE,
            scope: 'listen:events:self'
          });

          sendMessage(
            JSON.stringify({
              type: 'authenticate',
              access_token: token
            })
          );
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [user, isLoading, lastJsonMessage && lastJsonMessage.type]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];
  return (
    <Layout>
      <h1>Acme Timesheets</h1>

      <h4>Session Stream</h4>
      <span>
        The stream is currently <strong>{connectionStatus}</strong> and here is the last message we received:
      </span>
      <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
      {error && (
        <>
          <h4>Error</h4>
          <pre>{error.message}</pre>
        </>
      )}

      {user && (
        <>
          <h4>Rendered user info on the client</h4>
          <pre data-testid="profile">{JSON.stringify(user, null, 2)}</pre>
        </>
      )}

      {!isLoading && !error && !user && (
        <>
          <p>
            To test the login click in <i>Login</i>
          </p>
          <p>
            Once you have logged in you should be able to click in <i>Protected Page</i> and <i>Logout</i>
          </p>
        </>
      )}
    </Layout>
  );
}
