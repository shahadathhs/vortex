import { Schema, model } from 'mongoose';

export interface INotification {
  type: string;
  recipientId?: string | null;
  recipientRole?: 'system' | 'seller' | 'buyer';
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true },
    recipientId: { type: String, default: null },
    recipientRole: { type: String, enum: ['system', 'seller', 'buyer'] },
    payload: { type: Schema.Types.Mixed, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

export const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);
