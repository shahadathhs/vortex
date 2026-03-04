import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import { logger } from '@vortex/common';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    const userId =
      socket.handshake.auth?.userId ?? socket.handshake.query?.userId;
    if (userId) {
      void socket.join(`user:${userId}`);
      logger.info(`Socket connected: user ${userId}`);
    }

    socket.on('disconnect', () => {
      logger.info('Socket disconnected');
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

export function emitToUser(
  userId: string,
  event: string,
  payload: Record<string, unknown>,
): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
