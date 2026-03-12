'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'buyer') router.replace('/buyer/shop');
    else if (user.role === 'seller') router.replace('/seller/products');
    else router.replace('/system/analytics');
  }, [user, isLoading, router]);

  return null;
}
