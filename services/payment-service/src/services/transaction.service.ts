import { Transaction } from '../models/Transaction';
import type { IOrderItem } from '../types/order';

export async function createTransactionsForOrder(
  orderId: string,
  items: IOrderItem[],
  platformFeePercent: number,
) {
  const bySeller = new Map<string, { amountCents: number }>();

  for (const item of items) {
    const sellerId = item.sellerId;
    if (!sellerId) continue;

    const amountCents = Math.round(item.price * item.quantity * 100);
    const existing = bySeller.get(sellerId);
    if (existing) {
      existing.amountCents += amountCents;
    } else {
      bySeller.set(sellerId, { amountCents });
    }
  }

  const transactions = [];
  for (const [sellerId, { amountCents }] of bySeller) {
    const platformFeeCents = Math.round(
      amountCents * (platformFeePercent / 100),
    );
    const sellerAmountCents = amountCents - platformFeeCents;
    if (sellerAmountCents < 1) continue;

    const tx = await Transaction.findOneAndUpdate(
      { orderId, sellerId },
      {
        $setOnInsert: {
          orderId,
          sellerId,
          amountCents,
          platformFeeCents,
          sellerAmountCents,
          status: 'PENDING',
        },
      },
      { upsert: true, new: true },
    );
    transactions.push(tx);
  }
  return transactions;
}

export async function getPendingTransactions() {
  return Transaction.find({ status: 'PENDING' }).sort({ createdAt: 1 }).lean();
}

export async function markTransactionTransferred(
  id: string,
  stripeTransferId: string,
) {
  return Transaction.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'TRANSFERRED',
        stripeTransferId,
        transferredAt: new Date(),
      },
    },
    { new: true },
  );
}

export async function markTransactionFailed(id: string, failureReason: string) {
  return Transaction.findByIdAndUpdate(
    id,
    { $set: { status: 'FAILED', failureReason } },
    { new: true },
  );
}
