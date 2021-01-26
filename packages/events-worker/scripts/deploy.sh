#! /bin/bash
set -euo pipefail

# Required tools.
if ! which curl >/dev/null; then
  echo "$0: Please install curl" >&2
  exit 1
fi
if ! which jq >/dev/null; then
  echo "$0: Please install jq" >&2
  exit 1
fi

# The .env file will contail the credentials we used to connect to the API.
if [ -e .env ]; then
  source .env
else
  echo -n "Please create a .env file"
  return 1
fi

# Helper to call the cloudflare API.
api() {
  RESULT=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID$@")
  if [[ $RESULT == *"\"success\": true"* ]]; then
    return 0
  else
    printf "\nAPI Error: " >&2
    printf "$RESULT" | jq >&2
    return 1
  fi
}

# Test credentials.
printf "\n"
printf "[+] Checking if credentials can access Durable Objects...\n"
api /workers/scripts > /dev/null
api /workers/durable_objects/namespaces > /dev/null
printf "[+] Credentials OK!\n"

# Upload script.
printf "[+] Uploading script...\n"

cat > metadata.json << __EOF__
{
  "body_part": "script",
  "bindings": [
    {
      "type": "durable_object_namespace",
      "name": "$NAMESPACE",
      "namespace_id": "$NAMESPACE_ID"
    }
  ]
}
__EOF__
api /workers/scripts/$SCRIPT_NAME \
    -X PUT \
    -F "metadata=@metadata.json;type=application/json" \
    -F "script=@dist/worker.js;type=application/javascript" > /dev/null
rm metadata.json

printf "[+] Done\n"