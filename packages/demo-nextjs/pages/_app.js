import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Auth0Provider } from '@auth0/auth0-react';

import 'tailwindcss/tailwind.css';

function App({ Component, pageProps }) {
  const router = useRouter();

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
      audience={process.env.NEXT_PUBLIC_AUDIENCE}
      scope="listen:events:self"
      redirectUri={typeof window !== 'undefined' && window.location.origin}
      onRedirectCallback={(appState) => {
        router.replace(appState?.returnTo || window.location.pathname);
      }}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false
});
