import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(userId?: string): Socket {
  socket ??= io('/', {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: userId ? { userId } : {},
    autoConnect: false,
  });
  return socket;
}

export function connectSocket(userId: string): void {
  const s = getSocket(userId);
  if (!s.connected) {
    s.auth = { userId };
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}
