import React from 'react';
import Head from 'next/head';
import useAuth0Events from '@a0-events/sdk-react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

import Layout from '../components/layout';

export default withAuthenticationRequired(function Timesheets() {
  const { user, error, isLoading } = useAuth0();
  const { connectionStatus, lastJsonMessage } = useAuth0Events(process.env.NEXT_PUBLIC_AUTH0_EVENTS_DOMAIN);

  return (
    <Layout>
      <Head>
        <title>ACME Timesheets - My Timesheets</title>
      </Head>
    </Layout>
  );
});
