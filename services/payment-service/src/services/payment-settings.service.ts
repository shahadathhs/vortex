import { PaymentSettings } from '../models/PaymentSettings';

const DEFAULT_SETTINGS = {
  paymentEnabled: true,
  platformFeePercent: 10,
  automaticPayoutsEnabled: false,
  payoutDayOfMonth: 1,
};

export async function getPaymentSettings() {
  let settings = await PaymentSettings.findOne();
  settings ??= await PaymentSettings.create(DEFAULT_SETTINGS);
  return settings;
}

export async function updatePaymentSettings(data: {
  paymentEnabled?: boolean;
  platformFeePercent?: number;
  automaticPayoutsEnabled?: boolean;
  payoutDayOfMonth?: number;
}) {
  let settings = await PaymentSettings.findOne();
  settings ??= await PaymentSettings.create(DEFAULT_SETTINGS);
  if (data.paymentEnabled !== undefined)
    settings.paymentEnabled = data.paymentEnabled;
  if (data.platformFeePercent !== undefined)
    settings.platformFeePercent = Math.max(
      0,
      Math.min(100, data.platformFeePercent),
    );
  if (data.automaticPayoutsEnabled !== undefined)
    settings.automaticPayoutsEnabled = data.automaticPayoutsEnabled;
  if (data.payoutDayOfMonth !== undefined)
    settings.payoutDayOfMonth = Math.max(
      1,
      Math.min(28, data.payoutDayOfMonth),
    );
  await settings.save();
  return settings;
}
