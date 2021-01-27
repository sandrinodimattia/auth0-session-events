import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import useAuth0Events from '@a0-events/sdk-react';

import Layout from '../components/layout';

export default function Home() {
  const { user, error, isLoading, logout, getAccessTokenSilently } = useAuth0();
  const { connectionStatus, lastJsonMessage } = useAuth0Events(process.env.NEXT_PUBLIC_AUTH0_EVENTS_DOMAIN);

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
