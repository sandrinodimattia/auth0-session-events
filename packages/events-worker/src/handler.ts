import { jsonResponse, getPath, handleErrors } from '@a0-events/common';

import { WorkerEnvironment } from './types';

/**
 * Dispath the request to the durable object instance.
 * @param req Request
 * @param path Updated path (eg: /api/subscribe)
 * @param domain acme.auth0.com
 * @param ns Durable object namespace.
 */
const dispatch = (req: Request, path: string, domain: string, ns: DurableObjectNamespace): Promise<Response> => {
  const tenantId = ns.idFromName(domain);
  const tenantObject: any = ns.get(tenantId);

  // Rewrite the url.
  const url = new URL(req.url);
  url.pathname = path;

  // Add custom headers to the request.
  const durableObjectRequest = new Request(req);
  durableObjectRequest.headers.set('x-tenant-domain', domain);

  // Call the durable object.
  return tenantObject.fetch(url, durableObjectRequest);
};

/**
 * Handler for the incoming HTTP requests.
 */
export default async (request: Request, env: WorkerEnvironment): Promise<Response> => {
  return handleErrors(request, async () => {
    // The path will be something like: /sandrino/api/subscribe or /sandrino@eu/api/subscribe
    const path = getPath(request.url);

    // Parse the tenant, route and action.
    const [tenant, ...route] = path.slice(1).split('/');
    if (!tenant || !route) {
      return jsonResponse(404, {
        error: 'not_found',
        error_description: `The path ${path} was not found`
      });
    }

    // We'll use the tenant domain to generate the Auth0 domain
    // /sandrino/api/subscribe becomes sandrino.auth0.com
    // /sandrino@us/api/subscribe becomes sandrino.us.auth0.com
    const tenantDomain = `${tenant.replace('@', '.')}.auth0.com`;

    // We want the internal path to always be /api/something
    const internalPath = `/${route.join('/')}`;

    // Forward requests to the durable object.
    switch (internalPath) {
      case '/_debug':
        return jsonResponse(200, {
          host: request.headers.get('host'),
          url: request.url,
          path,
          internal_path: internalPath,
          tenant,
          tenant_domain: tenantDomain
        });
      // Forward all API routes to the Durable Object.
      case '/api/_debug':
      case '/api/listeners':
      case '/api/subscribe':
      case '/api/publish':
        const { userEventSubscribers } = env;
        return dispatch(request, internalPath, tenantDomain, userEventSubscribers);
      default:
        return jsonResponse(404, {
          error: 'not_found',
          error_description: `The path ${path} was not found`
        });
    }
  });
};
