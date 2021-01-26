/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  /**
   * Undocumented websockets object provided by Cloudflare Durable Objects.
   */
  const WebSocketPair: any;
}

/**
 * Return a JSON response
 * @param obj
 */
export const jsonResponse = (statusCode: number, obj: unknown): Response =>
  new Response(JSON.stringify(obj), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }
  });

/**
 * Return a websocket response.
 * @param socket One side of the pair.
 */
export const wsResponse = (socket: unknown): Response => {
  const responseInit: any = { status: 101, webSocket: socket };
  return new Response(null, responseInit);
};

/**
 * Extract the path of the URL.
 * @param url
 */
export const getPath = (url: string): string => new URL(url).pathname;

/**
 * Interface for a Cloudflare Worker request handler.
 */
export interface RequestHandler {
  (): Promise<Response>;
}

/**
 * Handle any uncaught errors.
 * @param request Request
 * @param fn RequestHandler
 */
export const handleErrors = async (request: Request, fn: RequestHandler): Promise<Response> => {
  try {
    return await fn();
  } catch (err) {
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      pair[1].accept();
      pair[1].send(JSON.stringify({ error: err.stack }));
      pair[1].close(1011, 'Uncaught exception during session setup');
      return wsResponse(pair[0]);
    }

    return new Response(err.stack, { status: 500 });
  }
};
