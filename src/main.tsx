import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { reloadOnServiceWorkerUpdate } from './util/service/serviceWorker/reloadOnUpdate';

reloadOnServiceWorkerUpdate();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);