// Service for managing push notifications in the browser
const VAPID_PUBLIC_KEY = 'BMQvHa7bPn-U5moYpopmGkGlze0kdCRlb1z-ZkSYcW_YmbKIkmYNrHZgLqtvRf__zHFoHWkW7o6AWz7Kj7uXWVQ';

export class NotificationService {
  static async requestPermission() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.log('Push Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  static async subscribe(authToken) {
    try {
      // Request notification permission first
      const permitted = await this.requestPermission();
      if (!permitted) {
        console.log('Notification permission denied');
        return null;
      }

      // Register service worker
      const registration = await this.registerServiceWorker();

      // Create push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to backend
      const response = await fetch('/api/subscribe-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register subscription');
      }

      console.log('Push subscription registered successfully');
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  static async unsubscribe() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          console.log('Unsubscribed from push notifications');
        }
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  static isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
}

export default NotificationService;
