// utils/NotificationChannel.js

export const CHANNEL_NAME = 'app-notifications';

export function createNotificationChannel() {
  return new BroadcastChannel(CHANNEL_NAME);
}
