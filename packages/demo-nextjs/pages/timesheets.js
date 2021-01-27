import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

import { useApi } from '../lib/use-api';
import Layout from '../components/layout';

export default withAuthenticationRequired(function Timesheets() {
  const { get, isPending, error, data = [] } = useApi(`${process.env.NEXT_PUBLIC_API_BASE_URL}`);

  useEffect(() => {
    get('/timesheets', {
      audience: process.env.NEXT_PUBLIC_AUDIENCE
    });
  }, []);

  return (
    <Layout>
      <Head>
        <title>ACME Timesheets - My Timesheets</title>
      </Head>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-10 mx-auto">
          <div className="flex flex-wrap">
            <div className="w-full">
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-2 text-gray-900">My Timesheets</h1>
              <div className="h-1 w-10 bg-indigo-500 rounded"></div>
            </div>
          </div>
        </div>
      </section>
      {error && (
        <div>
          <div class="container px-5 py-4 mx-auto flex flex-col">
            <div class="flex flex-col py-6 mb-12">
              <p class="">An error occured:</p>
              <pre className="mt-5">
                <code>
                  {JSON.stringify(
                    {
                      error: (error.body && error.body.error) || error.name,
                      message: (error.body && error.body.error_description) || error.message
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
      {isPending ? (
        <div class="container px-5 py-4 mx-auto flex flex-col">
          <div class="h-1 bg-gray-200 rounded overflow-hidden">
            <div class="w-4 h-full bg-indigo-500"></div>
          </div>
          <div class="flex flex-wrap sm:flex-row flex-col py-6 mb-12">
            <p class="">Loading...</p>
          </div>
        </div>
      ) : (
        data && (
          <section className="text-gray-600 body-font">
            <div className="container px-5 py-4 mx-auto">
              <div className="w-full mx-auto overflow-auto">
                <div class="flex mb-4 w-full mx-auto">
                  <button
                    onClick={(e) =>
                      get('/timesheets', {
                        audience: process.env.NEXT_PUBLIC_AUDIENCE
                      })
                    }
                    class="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                  >
                    Refresh
                  </button>
                </div>
                <table className="table-auto w-full text-left whitespace-no-wrap">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">
                        Date
                      </th>
                      <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
                        Title
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((record) => {
                      return (
                        <tr key={record.date}>
                          <td className="border-t-2 border-gray-200 px-4 py-3">{record.date}</td>
                          <td className="border-t-2 border-gray-200 px-4 py-3">{record.title}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div class="flex mt-4 w-full mx-auto">
                <button class="flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">
                  Create
                </button>
              </div>
            </div>
          </section>
        )
      )}
    </Layout>
  );
});
