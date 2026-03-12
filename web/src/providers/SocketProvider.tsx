'use client';

import { createContext, useContext, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAuth } from './AuthProvider';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
    } else {
      disconnectSocket();
    }
    return () => {
      // Do not disconnect on every re-render, only on unmount
    };
  }, [user?._id]);

  const socket = user?._id ? getSocket(user._id) : null;

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
