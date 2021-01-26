import jsonResponse from '@a0-events/common';

export class EventSubscribersDurableObject {
  async fetch(request: Request): Promise<Response | void> {
    return jsonResponse(400, {
      url: request.url,
    });
  }
}

/**
 * Dummy object required to deploy the Durable object.
 */
export default {
  fetch(): Response {
    return new Response();
  },
};
