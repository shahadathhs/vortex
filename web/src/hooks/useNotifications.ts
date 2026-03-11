'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/types';
import { useSocket } from '@/providers/SocketProvider';

export function useNotifications() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApi.list();
      return res.data as Notification[];
    },
  });

  useEffect(() => {
    if (!socket) return;
    const handler = (notification: Notification) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
        prev ? [notification, ...prev] : [notification],
      );
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket, queryClient]);

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
        prev?.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    },
  });

  const unreadCount = query.data?.filter((n) => !n.read).length ?? 0;

  return {
    notifications: query.data ?? [],
    unreadCount,
    markRead,
    isLoading: query.isLoading,
  };
}
