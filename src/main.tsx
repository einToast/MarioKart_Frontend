import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { reloadOnServiceWorkerUpdate } from './util/service/serviceWorker/reloadOnUpdate';
import { initLanguage } from './i18n';
import { DEFAULT_LANGUAGE, setBaseLanguage } from './i18n/languages';
import { PublicSettingsService } from './util/service';

reloadOnServiceWorkerUpdate();

const container = document.getElementById('root');
const root = createRoot(container!);
try {
  setBaseLanguage(await PublicSettingsService.getDefaultLanguage().catch(() => DEFAULT_LANGUAGE));
  await initLanguage();
} finally {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}