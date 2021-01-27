const React = require('react');
const { default: useWebSocket, ReadyState } = require('react-use-websocket');
const { useAuth0 } = require('@auth0/auth0-react');

module.exports = (eventsDomain) => {
  const { user, error, isLoading, logout, getAccessTokenSilently } = useAuth0();
  const [authenticating, setAuthenticating] = React.useState(false);
  const [socketUrl, setSocketUrl] = React.useState(`wss://${eventsDomain}/api/subscribe`);
  const { sendMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onMessage: (e) => {
      console.log('Auth0 Message Received: ', e.data);

      const msg = JSON.parse(e.data);
      if (msg.type === 'authenticated') {
        setAuthenticating(false);
      } else if (msg.type === 'logout') {
        logout({ returnTo: window.location.origin });
      } else if (msg.type === 'user_blocked') {
        logout({ returnTo: window.location.origin });
      } else if (msg.type === 'password_changed') {
        logout({ returnTo: window.location.origin });
      }
    }
  });

  React.useEffect(() => {
    if (user && !authenticating && lastJsonMessage && lastJsonMessage.type === 'connected') {
      console.log('Auth0 Events: Starting authentication...');
      setAuthenticating(true);
      (async () => {
        try {
          console.log('Auth0 Events: Getting token...');
          const token = await getAccessTokenSilently({
            audience: 'https://events.auth0a.com/api',
            scope: 'listen:events:self'
          });

          sendMessage(
            JSON.stringify({
              type: 'authenticate',
              access_token: token
            })
          );
        } catch (e) {
          console.log('Auth0 Events: ', e.message);
        }
      })();
    }
  }, [user, lastJsonMessage && lastJsonMessage.type]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  return {
    authenticating,
    connectionStatus,
    lastJsonMessage
  };
};
