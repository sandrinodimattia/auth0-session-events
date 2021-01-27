import { useFetch } from 'react-async';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const useApi = (baseUrl) => {
  const [loading, setLoading] = useState();
  const [httpError, setHttpError] = useState();
  const { getAccessTokenSilently } = useAuth0();
  const { data, error, setError, isPending, run } = useFetch(
    baseUrl,
    { headers: { Accept: 'application/json' } },
    { defer: true }
  );

  const isLoading = loading || isPending;

  useEffect(() => {
    async function parseError() {
      if (error) {
        const e = new Error(error.message);
        e.code = error.error;
        e.message = error.message || error.error_description;

        if (error.response) {
          e.status = error.response.status;
          e.body = await error.response.text();
        }

        try {
          e.body = JSON.parse(e.body);
        } catch (err) {
        } finally {
          setHttpError(e);
        }
      } else {
        setHttpError(null);
      }
    }
    parseError();
  }, [error]);

  return {
    data: isLoading || error ? null : data,
    error: httpError || error,
    isPending: (error && false) || isLoading,
    get: async (endpoint, options) => {
      setLoading(true);
      setHttpError(null);
      try {
        const { audience, scope, ...fetchOptions } = options;
        const accessToken = await getAccessTokenSilently({ audience, scope });
        // Execute the request.
        run((init) => {
          const headers = init.headers;
          console.log('getting', `${init.resource}${endpoint}`);
          return {
            ...init,
            resource: `${init.resource}${endpoint}`,
            headers:
              (accessToken && {
                ...headers,
                Authorization: 'Bearer ' + accessToken
              }) ||
              headers
          };
        });
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
  };
};
