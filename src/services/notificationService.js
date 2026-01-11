// Service for managing email notifications

export class NotificationService {
  static async enableEmailNotifications(authToken) {
    try {
      const response = await fetch('/api/enable-email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to enable email notifications');
      }

      console.log('Email notifications enabled successfully');
      return true;
    } catch (error) {
      console.error('Failed to enable email notifications:', error);
      throw error;
    }
  }

  static async disableEmailNotifications(authToken) {
    try {
      const response = await fetch('/api/disable-email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disable email notifications');
      }

      console.log('Email notifications disabled successfully');
      return true;
    } catch (error) {
      console.error('Failed to disable email notifications:', error);
      throw error;
    }
  }

  static isSupported() {
    return true; // Email notifications are always supported
  }
}

export default NotificationService;

