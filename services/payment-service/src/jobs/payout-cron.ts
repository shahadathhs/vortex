import { logger } from '@vortex/common';

import { getPaymentSettings } from '../services/payment-settings.service';
import { runSettlement } from '../services/settlement.service';

export async function startPayoutCron() {
  const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  const runIfScheduled = async () => {
    try {
      const settings = await getPaymentSettings();
      if (!settings.automaticPayoutsEnabled) return;

      const now = new Date();
      const dayOfMonth = now.getDate();
      if (dayOfMonth !== settings.payoutDayOfMonth) return;

      logger.info('Running scheduled payout settlement');
      const result = await runSettlement();
      logger.info(
        `Payout cron completed: ${result.transferred} transferred, ${result.failed} failed`,
      );
    } catch (err) {
      logger.error('Payout cron error:', err);
    }
  };

  void (await runIfScheduled());
  setInterval(async () => await runIfScheduled(), CHECK_INTERVAL_MS);
  logger.info('Payout cron started (checks hourly on payout day)');
}
