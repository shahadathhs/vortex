import { logger } from '@vortex/common';

import { sendEmail } from '../lib/email';

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  return '';
}

export async function handleTfaOtpRequested(data: Record<string, unknown>) {
  const email = safeStr(data.email);
  const otp = safeStr(data.otp);
  const purpose = safeStr(data.purpose);

  const subject =
    purpose === 'enable'
      ? 'Your verification code to enable Two-Factor Authentication'
      : 'Your login verification code';

  const html = `
<h1>Verification Code</h1>
<p>Your verification code is: <strong>${otp}</strong></p>
<p>This code expires in 10 minutes. Do not share it with anyone.</p>
<p>If you did not request this, please ignore this email.</p>
`;

  logger.info(`[TFA OTP] Sending ${purpose} code to ${email}`);

  await sendEmail(email, subject, html);
}
