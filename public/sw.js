/* eslint-env serviceworker */
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);


self.addEventListener('push', (event) => {
  
    let title = 'Mario Kart Turnier';
    let body = 'Mario Kart Turnier';
  
    try {
      const text = event.data?.text?.();
  
      try {
        const data = JSON.parse(text);
        title = data.title || title;
        body = data.body || body;
      } catch (err) {
        body = text || body;
      }
    } catch (err) {
      body = 'Neue Benachrichtigung erhalten';
    }
  
  
    const options = {
      body,
      icon: '/assets/icon/pwa-64x64.png',
      badge: '/assets/icon/pwa-64x64.png',
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
  