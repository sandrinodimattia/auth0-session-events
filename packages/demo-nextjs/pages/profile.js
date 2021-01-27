import React from 'react';
import Head from 'next/head';
import useAuth0Events from '@a0-events/sdk-react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

import Layout from '../components/layout';

export default withAuthenticationRequired(function Profile() {
  const { user, error, isLoading } = useAuth0();
  const { connectionStatus, lastJsonMessage } = useAuth0Events(process.env.NEXT_PUBLIC_AUTH0_EVENTS_DOMAIN);

  return (
    <Layout>
      <Head>
        <title>ACME Timesheets - My Profile</title>
      </Head>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-10 mx-auto">
          <div className="flex flex-wrap">
            <div className="w-full">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">My Profile</h1>
              <div className="h-1 w-20 bg-indigo-500 rounded"></div>
            </div>
          </div>
        </div>
      </section>
      <section className="text-gray-600 body-font overflow-hidden border">
        <div className="container px-5 py-10 mx-auto">
          <div className="mx-auto flex flex-wrap">
            <div className="lg:w-1/2 w-full lg:pr-10 lg:py-6 mb-6 lg:mb-0">
              <h2 className="text-sm title-font text-gray-500 tracking-widest">USER PROFILE</h2>
              <div className="flex border-t border-gray-200 py-2">
                <span className="text-gray-500">Loading</span>
                <span className="ml-auto text-gray-900">
                  <pre>{`${isLoading}`}</pre>
                </span>
              </div>
              <div className="flex border-t border-gray-200 py-2">
                <span className="text-gray-500">Authenticated</span>
                <span className="ml-auto text-gray-900">
                  <pre>{`${user != null}`}</pre>
                </span>
              </div>
              <div className="flex border-t border-gray-200 py-2">
                <span className="text-gray-500">User ID</span>
                <span className="ml-auto text-gray-900">
                  <pre>{user && user.sub}</pre>
                </span>
              </div>
              {error && (
                <div className="flex flex-col overflow-hidden border-t border-gray-200 py-2">
                  <span className="text-gray-500">Error</span>
                  <span className="text-gray-900 mt-5">
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                  </span>
                </div>
              )}
              <div className="flex flex-col overflow-hidden border-t border-gray-200 py-2">
                <span className="text-gray-500">Claims</span>
                <span className="text-gray-900 mt-5">
                  <pre>{JSON.stringify(user, null, 2)}</pre>
                </span>
              </div>
            </div>
            <div className="lg:w-1/2 w-full lg:pr-10 lg:py-6 mb-6 lg:mb-0">
              <h2 className="text-sm title-font text-gray-500 tracking-widest">STREAM CONNECTIVITY</h2>
              <div className="flex border-t border-gray-200 py-2">
                <span className="text-gray-500">Connection Status</span>
                <span className="ml-auto text-gray-900">
                  <pre>{connectionStatus}</pre>
                </span>
              </div>
              <div className="flex flex-col overflow-hidden border-t border-gray-200 py-2">
                <span className="text-gray-500">Last Message Received</span>
                <span className="text-gray-900 mt-5">
                  <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
});
