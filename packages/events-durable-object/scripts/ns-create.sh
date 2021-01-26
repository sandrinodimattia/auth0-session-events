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
  if [ $(echo "$RESULT" | jq .success) = true ]; then
    printf "$RESULT" | jq .result
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

# Existing namespace?
EXISTING_ID=$(\
    api /workers/durable_objects/namespaces | \
    jq -r ".[] | select(.script == \"$SCRIPT_NAME\") | .id")
if [ "$EXISTING_ID" != "" ]; then
  printf "[+] Namespace already exists: $EXISTING_ID\n"
else 
  # Create namespace.
  printf "[+] Registering namespace $NAMESPACE (class: $CLASS_NAME)...\n"
  api /workers/durable_objects/namespaces \
      -X POST --data "{\"name\": \"$NAMESPACE\", \"script\": \"$SCRIPT_NAME\", \"class\": \"$CLASS_NAME\"}" | \
      jq
  printf "[+] Done\n"
fi