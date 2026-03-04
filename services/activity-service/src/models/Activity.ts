import { Schema, model } from 'mongoose';

export interface IActivity {
  actorId: string;
  actorRole: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actorId: { type: String, required: true, index: true },
    actorRole: { type: String, required: true, index: true },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

activitySchema.index({ actorId: 1, timestamp: -1 });
activitySchema.index({ resource: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });

export const Activity = model<IActivity>('Activity', activitySchema);
