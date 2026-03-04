import { Schema, model } from 'mongoose';

import {
  REALTIME_NOTIFICATION_TYPES,
  type RealtimeNotificationType,
} from '../constants/notification-types';

export interface INotificationSettings {
  userId: string;
  emailTypes: RealtimeNotificationType[];
  socketTypes: RealtimeNotificationType[];
  updatedAt: Date;
}

const notificationSettingsSchema = new Schema<INotificationSettings>(
  {
    userId: { type: String, required: true, unique: true },
    emailTypes: {
      type: [String],
      default: [...REALTIME_NOTIFICATION_TYPES],
      validate: {
        validator: (v: string[]) =>
          v.every((t) =>
            (REALTIME_NOTIFICATION_TYPES as readonly string[]).includes(t),
          ),
        message: 'Invalid notification type',
      },
    },
    socketTypes: {
      type: [String],
      default: [...REALTIME_NOTIFICATION_TYPES],
      validate: {
        validator: (v: string[]) =>
          v.every((t) =>
            (REALTIME_NOTIFICATION_TYPES as readonly string[]).includes(t),
          ),
        message: 'Invalid notification type',
      },
    },
  },
  { timestamps: true },
);

notificationSettingsSchema.index({ userId: 1 });

export const NotificationSettings = model<INotificationSettings>(
  'NotificationSettings',
  notificationSettingsSchema,
);
