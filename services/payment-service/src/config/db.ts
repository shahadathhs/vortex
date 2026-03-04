import { logger } from '@vortex/common';
import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  await mongoose.connect(uri);
  logger.info('Payment DB connected');
}
