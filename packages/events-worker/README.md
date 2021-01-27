# @a0-events/events-worker

The Cloudflare Worker which will route requests to a Durable Object.

## Deployment

Start by creating a `.env` file:

```bash
ACCOUNT_ID=YOUR_CF_ACCOUNT_ID
AUTH_TOKEN=YOUR_CF_ACCOUNT_TOKEN
SCRIPT_NAME=events-worker
CLASS_NAME=EventSubscribersDurableObject
NAMESPACE=userEventSubscribers
NAMESPACE_ID=THE_NAMESPACE_ID_OF_YOUR_DURABLE_OBJECT
```

Deploy the script:

```bash
npm run build
./scripts/deploy.sh
```
