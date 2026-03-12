'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '@/lib/api';
import { Notification } from '@/types';
import { useSocket } from '@/providers/SocketProvider';

export function useNotifications() {
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const res = (await notificationApi.list()) as Notification[];
      setNotifications(res ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket) return;
    const handler = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on('notification', handler);
    return () => {
      socket.off('notification', handler);
    };
  }, [socket]);

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev?.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Error
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markRead: { mutate: markRead },
    isLoading,
  };
}
