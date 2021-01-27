import React from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

import Layout from '../components/layout';

export default withAuthenticationRequired(function Profile() {
  const { user, error, isLoading } = useAuth0();

  return (
    <Layout>
      <h1>Profile</h1>

      {isLoading && <p>Loading profile...</p>}

      {error && (
        <>
          <h4>Error</h4>
          <pre>{error.message}</pre>
        </>
      )}

      {user && (
        <>
          <h4>Profile</h4>
          <pre data-testid="profile">{JSON.stringify(user, null, 2)}</pre>
        </>
      )}
    </Layout>
  );
});
