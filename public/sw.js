import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

self.skipWaiting();
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);


const FALLBACK_TEXTS = {
  de: { title: 'Mario Kart Turnier', body: 'Neue Benachrichtigung erhalten', open: 'Öffnen', close: 'Schließen' },
  en: { title: 'Mario Kart Tournament', body: 'New notification received', open: 'Open', close: 'Close' },
};

const fallbackTexts = async () => {
  try {
    const cookie = await self.cookieStore?.get('language');
    return FALLBACK_TEXTS[cookie?.value] ?? FALLBACK_TEXTS.de;
  } catch {
    return FALLBACK_TEXTS.de;
  }
};

const showPushNotification = async (event) => {
    const fallback = await fallbackTexts();
    let title = fallback.title;
    let body = fallback.title;
    let actions = { open: fallback.open, close: fallback.close };

    try {
      const text = event.data?.text?.();

      try {
        const data = JSON.parse(text);
        title = data.title || title;
        body = data.body || body;
        actions = { open: data.actions?.open || actions.open, close: data.actions?.close || actions.close };
      } catch {
        // Payload is not JSON: show it as plain text
        body = text || body;
      }
    } catch {
      // Payload could not be read: fall back to a generic message
      body = fallback.body;
    }


    const options = {
      body,
      icon: '/assets/icons/pwa-64x64.png',
      badge: '/assets/icons/pwa-64x64.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
      actions: [
        { action: 'explore', title: actions.open },
        { action: 'close', title: actions.close },
      ],
    };

    await self.registration.showNotification(title, options);
};

self.addEventListener('push', (event) => {
    event.waitUntil(showPushNotification(event));
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
  
    if (event.action !== 'close') {
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            if ('focus' in client) {
              client.focus();
              return client.navigate?.('/tab1') || undefined;
            }
          }
          return clients.openWindow?.('/tab1');
        })
      );
    }
  });
  