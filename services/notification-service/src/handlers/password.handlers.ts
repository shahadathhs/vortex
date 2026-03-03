import { logger } from '@vortex/common';

import { sendEmail } from '../lib/email';

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  return '';
}

export async function handlePasswordResetRequested(
  data: Record<string, unknown>,
) {
  const email = safeStr(data.email);
  const resetToken = safeStr(data.resetToken);
  const resetUrl = safeStr(data.resetUrl);

  logger.info(`[Password Reset] Sending reset link to ${email}`);

  await sendEmail(
    email,
    'Reset Your Password',
    `<h1>Password Reset</h1><p>Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>Token (if manual): ${resetToken}</p><p>Link expires in 1 hour.</p>`,
  );
}
