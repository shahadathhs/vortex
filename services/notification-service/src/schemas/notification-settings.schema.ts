import { z } from 'zod';

import {
  REALTIME_NOTIFICATION_TYPES,
  type RealtimeNotificationType,
} from '../constants/notification-types';

const notificationTypeSchema = z.enum(
  REALTIME_NOTIFICATION_TYPES as unknown as [
    RealtimeNotificationType,
    ...RealtimeNotificationType[],
  ],
);

export const updateNotificationSettingsSchema = z.object({
  emailTypes: z.array(notificationTypeSchema).optional(),
  socketTypes: z.array(notificationTypeSchema).optional(),
});
