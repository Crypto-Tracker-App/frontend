// Service Worker for handling push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json?.() || {};
  const { notification = {} } = data;

  const options = {
    body: notification.body,
    icon: notification.icon || '/crypto-icon.png',
    badge: '/crypto-badge.png',
    tag: 'alert-notification',
    requireInteraction: false,
    data: notification.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(notification.title || 'Crypto Alert', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL('/', self.location).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
