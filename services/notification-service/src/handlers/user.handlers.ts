import { logger } from '@vortex/common';

import { sendEmail } from '../lib/email';

function safeStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}

export async function handleUserCreated(data: Record<string, unknown>) {
  const email = safeStr(data.email);
  const firstName = safeStr(data.firstName);

  logger.info(`[Welcome Email] Sending to ${email} (${firstName})`);

  await sendEmail(
    email,
    'Welcome to Vortex',
    `<h1>Welcome, ${firstName}!</h1><p>Thanks for signing up. Start browsing our catalog.</p>`,
  );
}
