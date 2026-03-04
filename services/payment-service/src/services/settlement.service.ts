import { logger } from '@vortex/common';

import { getUser } from '../lib/http-client';
import { transferToConnectAccount } from './connect.service';
import {
  getPendingTransactions,
  markTransactionFailed,
  markTransactionTransferred,
} from './transaction.service';

export interface SettlementResult {
  transferred: number;
  failed: number;
  errors: string[];
}

export async function runSettlement(): Promise<SettlementResult> {
  const pending = await getPendingTransactions();
  const result: SettlementResult = { transferred: 0, failed: 0, errors: [] };

  for (const tx of pending) {
    try {
      const userRes = await getUser(tx.sellerId);
      const accountId = userRes?.data?.stripeAccountId;

      if (!accountId) {
        await markTransactionFailed(
          String(tx._id),
          'Seller has no Stripe Connect account',
        );
        result.failed++;
        result.errors.push(
          `Transaction ${String(tx._id)}: Seller ${tx.sellerId} has no Connect account`,
        );
        continue;
      }

      const transfer = await transferToConnectAccount(
        accountId,
        tx.sellerAmountCents,
        `Order ${tx.orderId} - Seller payout`,
      );

      await markTransactionTransferred(String(tx._id), transfer.id);
      result.transferred++;
      logger.info(
        `Transferred ${tx.sellerAmountCents} cents to seller ${tx.sellerId} for order ${tx.orderId}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await markTransactionFailed(String(tx._id), message);
      result.failed++;
      result.errors.push(`Transaction ${String(tx._id)}: ${message}`);
      logger.error(`Settlement failed for transaction ${String(tx._id)}:`, err);
    }
  }

  return result;
}
