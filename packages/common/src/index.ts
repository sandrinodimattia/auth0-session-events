/**
 * Return a JSON response
 * @param obj
 */
export default (statusCode: number, obj: unknown): Response =>
  new Response(JSON.stringify(obj), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  });
