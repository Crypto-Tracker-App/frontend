// This service is deprecated - alerts are now handled through the backend polling mechanism
// See AlertNotification component and useTriggeredAlerts hook for the new implementation

export class NotificationService {
  static async requestPermission() {
    console.warn('NotificationService.requestPermission is deprecated');
    return false;
  }

  static async registerServiceWorker() {
    console.warn('NotificationService.registerServiceWorker is deprecated');
    return null;
  }

  static async subscribe() {
    console.warn('NotificationService.subscribe is deprecated');
    return null;
  }

  static async unsubscribe() {
    console.warn('NotificationService.unsubscribe is deprecated');
  }

  static urlBase64ToUint8Array() {
    console.warn('NotificationService.urlBase64ToUint8Array is deprecated');
    return null;
  }

  static isSupported() {
    return false;
  }
}

export default NotificationService;

