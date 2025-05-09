/* eslint-env serviceworker */
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);


self.addEventListener('push', (event) => {
    console.log('[SW] Push empfangen');
  
    let title = 'Mario Kart Turnier';
    let body = 'Mario Kart Turnier';
  
    try {
      const text = event.data?.text?.();
      console.log('[SW] Nachricht als Text:', text);
  
      try {
        const data = JSON.parse(text);
        console.log('[SW] JSON geparst:', data);
        title = data.title || title;
        body = data.body || body;
      } catch (err) {
        console.warn('[SW] JSON-Parsing fehlgeschlagen:', err);
        body = text || body;
      }
    } catch (err) {
      console.error('[SW] Fehler beim Lesen der Nachricht:', err);
      body = 'Neue Benachrichtigung erhalten';
    }
  
    console.log('[SW] Notification Daten:', { title, body });
  
    const options = {
      body,
      icon: '/assets/icon/pwa-64x64.png',
      badge: '/assets/icon/favicon-64x64.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1',
      },
      actions: [
        { action: 'explore', title: 'Öffnen' },
        { action: 'close', title: 'Schließen' },
      ],
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event);
    event.notification.close();
  
    if (event.action === 'explore') {
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
  