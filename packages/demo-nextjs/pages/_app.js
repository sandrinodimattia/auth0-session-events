import React from 'react';
import dynamic from 'next/dynamic';
import { Auth0Provider } from '@auth0/auth0-react';

function App({ Component, pageProps }) {
  const { user } = pageProps;

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
      audience={process.env.NEXT_PUBLIC_AUDIENCE}
      scope="listen:events:self"
      redirectUri={typeof window !== 'undefined' && window.location.origin}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false
});
