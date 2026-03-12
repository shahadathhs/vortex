'use client';

import { Menu } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const ROLE_COLORS: Record<string, string> = {
  system: 'bg-purple-100 text-purple-800',
  seller: 'bg-blue-100 text-blue-800',
  buyer: 'bg-green-100 text-green-800',
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-3">
      <button
        className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
        onClick={onMenuClick}
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {user?.role && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full capitalize',
              ROLE_COLORS[user.role],
            )}
          >
            {user.role}
          </span>
        )}
        <NotificationBell />
        <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium border">
          {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}
