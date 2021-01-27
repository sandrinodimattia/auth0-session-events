# Next.js example

This is an example SPA which will automatically sign out when an administrator blocks their account or they've signed out from an other application.

## Configuration

### Creating a client in Auth0

Start by creating a SPA Application in the [Auth0 Dashboard](https://manage.auth0.com/):

1. Give the client a name, eg: "Acme Timesheets"
2. Configure the **Callback URL** to `http://localhost:3000`
3. Configur the origins to: `http://localhost:3000`
4. Take note of the **Auth0 Domain**, the **Auth0 Client ID** and **Auth0 Client Secret**

### Creating the Auth0 Events API in Auth0

Follow the instructions [here](https://github.com/sandrinodimattia/auth0-session-events#defining-an-api) to create the "Auth0 Events API", which is used to authenticate with the event stream.

### Running the application

Create a config file with the information from your client:

```dotenv
NEXT_PUBLIC_DOMAIN={YOUR-TENANT}.auth0.com
NEXT_PUBLIC_CLIENT_ID={YOUR-CLIENT-ID}
NEXT_PUBLIC_AUDIENCE=https://timesheets-api.herokuapp.com/api
NEXT_PUBLIC_AUTH0_EVENTS_DOMAIN=events.auth0a.com/{YOUR-TENANT}
NEXT_PUBLIC_API_BASE_URL=The URL to where your API is deployed, https://timesheets-api.herokuapp.com/api (the demo-api project)
```

> Note: Follow the instructions [here](https://github.com/sandrinodimattia/auth0-session-events#connecting-your-log-stream) to find your `NEXT_PUBLIC_AUTH0_EVENTS_DOMAIN` (eg: `events.auth0.com/sandrino@eu`)

Make sure you first complete the initial bootstrapping of repository by running this in the root:

```bash
npm install -g lerna
lerna bootstrap
```

Then run the application:

```bash
yarn install
yarn dev
```

## Testing the feature

There's several ways in which you can test this application:

- Sign in and then block your user in the dashboard. After a few seconds (max 30sec) you'll see that the user is automatically signed out from the browser.
- Sign in using two different tabs. Sign out of one tab. After a few seconds (max 30sec) you'll see that the user is automatically signed out of the other tab.
- Sign in using two different applications. Sign out of one application. After a few seconds (max 30sec) you'll see that the user is automatically signed out of the other application.
