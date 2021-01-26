declare global {
  const userEventSubscribers: DurableObjectNamespace;
}

import handler from './handler';

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    handler(event.request, {
      userEventSubscribers
    })
  );
});
