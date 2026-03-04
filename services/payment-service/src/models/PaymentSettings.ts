import { Schema, model } from 'mongoose';

export interface IPaymentSettings {
  paymentEnabled: boolean;
  platformFeePercent: number;
  automaticPayoutsEnabled: boolean;
  payoutDayOfMonth: number;
  updatedAt: Date;
}

const paymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    paymentEnabled: { type: Boolean, default: true },
    platformFeePercent: { type: Number, default: 10, min: 0, max: 100 },
    automaticPayoutsEnabled: { type: Boolean, default: false },
    payoutDayOfMonth: { type: Number, default: 1, min: 1, max: 28 },
  },
  { timestamps: true },
);

export const PaymentSettings = model<IPaymentSettings>(
  'PaymentSettings',
  paymentSettingsSchema,
);
