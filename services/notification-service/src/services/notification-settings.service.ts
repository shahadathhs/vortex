import {
  REALTIME_NOTIFICATION_TYPES,
  type RealtimeNotificationType,
} from '../constants/notification-types';
import { NotificationSettings } from '../models/NotificationSettings';

export async function getSettings(userId: string) {
  let settings = await NotificationSettings.findOne({ userId });
  settings ??= await NotificationSettings.create({
    userId,
    emailTypes: [...REALTIME_NOTIFICATION_TYPES],
    socketTypes: [...REALTIME_NOTIFICATION_TYPES],
  });
  return settings;
}

export async function updateSettings(
  userId: string,
  data: {
    emailTypes?: RealtimeNotificationType[];
    socketTypes?: RealtimeNotificationType[];
  },
) {
  let settings = await NotificationSettings.findOne({ userId });
  if (!settings) {
    settings = await NotificationSettings.create({
      userId,
      emailTypes: data.emailTypes ?? [...REALTIME_NOTIFICATION_TYPES],
      socketTypes: data.socketTypes ?? [...REALTIME_NOTIFICATION_TYPES],
    });
    return settings;
  }
  if (data.emailTypes !== undefined) settings.emailTypes = data.emailTypes;
  if (data.socketTypes !== undefined) settings.socketTypes = data.socketTypes;
  await settings.save();
  return settings;
}

export async function shouldDeliverRealtime(
  userId: string,
  notificationType: string,
  channel: 'email' | 'socket',
): Promise<boolean> {
  const settings = await NotificationSettings.findOne({ userId });
  if (!settings) return true; // default: deliver all
  const types =
    channel === 'email' ? settings.emailTypes : settings.socketTypes;
  return types.includes(notificationType as RealtimeNotificationType);
}
