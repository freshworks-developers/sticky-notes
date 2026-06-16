import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const AppLifecycleContext = createContext({
  isInitialized: false,
  isActive: false,
  client: null
});

export function useAppLifecycle() {
  return useContext(AppLifecycleContext);
}

function PlaceholderWrapper({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(function () {
    let isMounted = true;
    let clientRef = null;

    function onAppActivated() {
      if (isMounted) {
        setIsActive(true);
        setIsReady(true);
      }
    }

    function onAppDeactivated() {
      if (isMounted) {
        setIsActive(false);
      }
    }

    function initClient() {
      if (window.client) {
        return Promise.resolve(window.client);
      }

      return window.app.initialized().then(function (initializedClient) {
        window.client = initializedClient;
        return initializedClient;
      });
    }

    initClient().then(function (initializedClient) {
      if (!isMounted) {
        return;
      }

      clientRef = initializedClient;
      setClient(initializedClient);
      setIsReady(true);
      setIsActive(true);
      initializedClient.events.on('app.activated', onAppActivated);
      initializedClient.events.on('app.deactivated', onAppDeactivated);
    }).catch(function (err) {
      if (isMounted) {
        setError(err);
      }
    });

    return function () {
      isMounted = false;
      if (clientRef) {
        try {
          clientRef.events.off('app.activated', onAppActivated);
          clientRef.events.off('app.deactivated', onAppDeactivated);
        } catch (cleanupError) {
          console.warn(cleanupError);
        }
      }
    };
  }, []);

  if (error) {
    return <div className="sn-error">Unable to load sticky notes.</div>;
  }

  if (!isReady) {
    return <div className="sn-loading">Loading sticky note…</div>;
  }

  return (
    <AppLifecycleContext.Provider value={{ isInitialized: isReady, isActive: isActive, client: client }}>
      {children}
    </AppLifecycleContext.Provider>
  );
}

export function renderPlaceholder(Component) {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <PlaceholderWrapper>
        <Component />
      </PlaceholderWrapper>
    </React.StrictMode>
  );
}

export default PlaceholderWrapper;
