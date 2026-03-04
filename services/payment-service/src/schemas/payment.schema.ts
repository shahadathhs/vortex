import { z } from 'zod';

export const updatePaymentSettingsSchema = z.object({
  paymentEnabled: z.boolean().optional(),
  platformFeePercent: z.number().min(0).max(100).optional(),
  automaticPayoutsEnabled: z.boolean().optional(),
  payoutDayOfMonth: z.number().int().min(1).max(28).optional(),
});

export const connectOnboardingSchema = z.object({
  refreshUrl: z.string().url(),
  returnUrl: z.string().url(),
});
