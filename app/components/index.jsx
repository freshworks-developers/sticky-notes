import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './bootstrap/crayonsInit';
import '../styles/style.css';
import FullPageApp from './FullPageApp';

function Main() {
  const [client, setClient] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(function () {
    let isMounted = true;

    window.app.initialized().then(function (initializedClient) {
      if (!isMounted) {
        return;
      }
      window.client = initializedClient;
      setClient(initializedClient);
    }).catch(function () {
      if (isMounted) {
        setFailed(true);
      }
    });

    return function () {
      isMounted = false;
    };
  }, []);

  if (failed) {
    return <div className="sn-error">Agent Huddle could not connect to Freshworks.</div>;
  }

  if (!client) {
    return <div className="sn-loading">Loading sticky notes board…</div>;
  }

  return <FullPageApp client={client} />;
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
