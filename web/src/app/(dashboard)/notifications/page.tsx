'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils';
import { Bell, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markRead, isLoading } = useNotifications();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <span className="text-sm text-muted-foreground">
          {notifications.filter((n) => !n.read).length} unread
        </span>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="mx-auto mb-3 opacity-30" size={40} />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`bg-card border rounded-xl p-4 flex items-start gap-3 ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {!n.read ? (
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                ) : (
                  <Check size={16} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">
                  {n.type.replace(/\./g, ' ')}
                </p>
                {n.payload && Object.keys(n.payload).length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {JSON.stringify(n.payload)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(n.createdAt)}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead.mutate(n._id)}
                  className="text-xs text-primary hover:underline flex-shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
