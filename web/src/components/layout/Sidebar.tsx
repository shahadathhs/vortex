'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  BarChart3,
  Bell,
  User,
  Users,
  CreditCard,
  Activity,
  Zap,
  LogOut,
  Home,
  Store,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Buyer
  {
    href: '/buyer/shop',
    label: 'Shop',
    icon: <Store size={18} />,
    roles: ['buyer', 'system'],
  },
  {
    href: '/buyer/cart',
    label: 'Cart',
    icon: <ShoppingCart size={18} />,
    roles: ['buyer', 'system'],
  },
  {
    href: '/buyer/orders',
    label: 'My Orders',
    icon: <Package size={18} />,
    roles: ['buyer', 'system'],
  },
  {
    href: '/buyer/analytics',
    label: 'My Analytics',
    icon: <BarChart3 size={18} />,
    roles: ['buyer', 'system'],
  },
  // Seller
  {
    href: '/seller/products',
    label: 'Products',
    icon: <ShoppingBag size={18} />,
    roles: ['seller', 'system'],
  },
  {
    href: '/seller/orders',
    label: 'Orders',
    icon: <Package size={18} />,
    roles: ['seller', 'system'],
  },
  {
    href: '/seller/connect',
    label: 'Stripe Connect',
    icon: <CreditCard size={18} />,
    roles: ['seller', 'system'],
  },
  {
    href: '/seller/analytics',
    label: 'Sales Analytics',
    icon: <BarChart3 size={18} />,
    roles: ['seller', 'system'],
  },
  // System
  {
    href: '/system/sellers',
    label: 'Sellers',
    icon: <Users size={18} />,
    roles: ['system'],
  },
  {
    href: '/system/payment',
    label: 'Payments',
    icon: <Zap size={18} />,
    roles: ['system'],
  },
  {
    href: '/system/activities',
    label: 'Activity Log',
    icon: <Activity size={18} />,
    roles: ['system'],
  },
  {
    href: '/system/analytics',
    label: 'System Analytics',
    icon: <BarChart3 size={18} />,
    roles: ['system'],
  },
];

const sharedItems: NavItem[] = [
  {
    href: '/notifications',
    label: 'Notifications',
    icon: <Bell size={18} />,
    roles: ['buyer', 'seller', 'system'],
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: <User size={18} />,
    roles: ['buyer', 'seller', 'system'],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const role = user?.role ?? 'buyer';

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive(item.href)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {item.icon}
      {item.label}
    </Link>
  );

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-6 flex items-center gap-2">
        <div className="bg-primary text-primary-foreground rounded-md p-1.5">
          <Home size={16} />
        </div>
        <span className="font-bold text-lg">Vortex</span>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {role === 'buyer' && (
          <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Shopping
          </p>
        )}
        {role === 'seller' && (
          <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Seller
          </p>
        )}
        {role === 'system' ? (
          <>
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Buyer
            </p>
            {navItems
              .filter((i) => i.href.startsWith('/buyer'))
              .map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            <p className="px-3 py-1 mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Seller
            </p>
            {navItems
              .filter((i) => i.href.startsWith('/seller'))
              .map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            <p className="px-3 py-1 mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
            {navItems
              .filter((i) => i.href.startsWith('/system'))
              .map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
          </>
        ) : (
          filteredNav.map((item) => <NavLink key={item.href} item={item} />)
        )}

        <div className="border-t mt-4 pt-4">
          {sharedItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      <div className="px-2 mt-4 border-t pt-4">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-1"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}
