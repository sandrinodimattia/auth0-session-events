# @a0-events/events-durable-object

## Deployment

Start by creating a `.env` file:

```bash
ACCOUNT_ID=YOUR_CF_ACCOUNT_ID
AUTH_TOKEN=YOUR_CF_ACCOUNT_TOKEN
SCRIPT_NAME=events-durable-object
CLASS_NAME=EventSubscribersDurableObject
NAMESPACE=userEventSubscribers
```

Deploy the script:

```bash
npm run build
./scripts/deploy.sh
```

Create the namespace (only needs to happen once, and can only be done after you have deployed the script):

``bash
./scripts/ns-create.sh

````

This will return the following response:

```json
{
  "id": "...",
  "name": "userEventSubscribers",
  "script": "events-durable-object",
  "class": "EventSubscribersDurableObject"
}
````

To delete the namespace simply add the `id` to your `.env` file:

```bash
NAMESPACE_ID=...
```

Then run the delete script:

```bash
./scripts/ns-delete.sh
```
