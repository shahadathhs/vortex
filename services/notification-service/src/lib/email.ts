import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { logger } from '@vortex/common';

let transporter: Transporter | null = null;
let fromEmail = 'noreply@vortex.local';

export function initEmailTransport(
  host: string,
  port: number,
  user: string,
  pass: string,
  from?: string,
) {
  if (from) fromEmail = from;
  if (!host || !user || !pass) {
    logger.info('SMTP not configured; emails will be logged only');
    return;
  }
  transporter = nodemailer.createTransport({
    host,
    port: port || 587,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<boolean> {
  const from = fromEmail;
  if (!transporter) {
    logger.info(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text ?? html.replace(/<[^>]*>/g, ''),
    });
    logger.info(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    logger.error('Email send failed:', err);
    return false;
  }
}
