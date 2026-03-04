import { Schema, model } from 'mongoose';

export type TransactionStatus = 'PENDING' | 'TRANSFERRED' | 'FAILED';

export interface ITransaction {
  orderId: string;
  sellerId: string;
  amountCents: number;
  platformFeeCents: number;
  sellerAmountCents: number;
  status: TransactionStatus;
  stripeTransferId?: string;
  failureReason?: string;
  transferredAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    orderId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },
    amountCents: { type: Number, required: true },
    platformFeeCents: { type: Number, required: true, default: 0 },
    sellerAmountCents: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'TRANSFERRED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    stripeTransferId: { type: String },
    failureReason: { type: String },
    transferredAt: { type: Date },
  },
  { timestamps: true },
);

transactionSchema.index({ orderId: 1, sellerId: 1 }, { unique: true });

export const Transaction = model<ITransaction>(
  'Transaction',
  transactionSchema,
);
