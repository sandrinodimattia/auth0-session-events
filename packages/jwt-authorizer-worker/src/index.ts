import { jsonResponse } from '@a0-events/common';
import { JwtVerifier } from '@serverless-jwt/jwt-verifier';

/**
 * Keep a local cache of issuers.
 */
const verifiers: Record<string, JwtVerifier> = {};

const handleRequest = async (request: Request): Promise<Response> => {
  const path = new URL(request.url).pathname;

  // The only supported route is POST /
  if (path !== '/' || request.method !== 'POST') {
    return jsonResponse(400, {
      error: 'not_found',
      error_description: `Route not found: ${request.method} ${path}`
    });
  }

  try {
    const { issuer, access_token } = await request.json();
    if (typeof issuer === 'undefined' || issuer === null) {
      return jsonResponse(400, {
        error: 'issuer_required',
        error_description: 'The issuer must be provided'
      });
    }

    if (typeof access_token === 'undefined' || access_token === null) {
      return jsonResponse(400, {
        error: 'access_token_required',
        error_description: 'The access_token must be provided'
      });
    }

    // Create or fetch an active JWT verifier for this issuer.
    let verifier = verifiers[issuer];
    if (!verifier) {
      verifier = verifiers[issuer] = new JwtVerifier({
        audience: 'https://events.auth0a.com/api',
        issuer
      });
    }

    // Return the claims.
    return jsonResponse(200, await verifier.verifyAccessToken(access_token));
  } catch (err) {
    return jsonResponse(400, {
      error: err.code || 'error',
      error_description: err.message
    });
  }
};

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
