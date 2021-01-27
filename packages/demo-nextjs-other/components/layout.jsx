import React from 'react';
import Head from 'next/head';

import Header from './header';
import Footer from './footer';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen ">
    <Head>
      <title>ACME Expenses</title>
    </Head>

    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

export default Layout;
