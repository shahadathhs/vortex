// All requests go to the Next.js server at the same origin (/api/*).
// next.config.ts rewrites /api/:path* → GATEWAY_URL/:path* server-side,
// so the browser never talks to the gateway directly (no CORS required).
const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function setToken(token: string): void {
  localStorage.setItem('accessToken', token);
}

function clearAuth(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { skipAuth, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !skipAuth) {
    // Attempt token refresh
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        setToken(accessToken);
        headers.Authorization = `Bearer ${accessToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, {
          ...init,
          headers,
        });
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({}));
          throw new Error(err?.message ?? retryRes.statusText);
        }
        return retryRes.json() as Promise<T>;
      }
    } catch {
      // refresh failed
    }
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? res.statusText);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// Auth
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiFetch<{ user: unknown; accessToken: string; refreshToken: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true },
    ),

  login: (data: { email: string; password: string }) =>
    apiFetch<
      | { user: unknown; accessToken: string; refreshToken: string }
      | { requiresTfa: true; tfaToken: string }
    >('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  verifyTfaLogin: (data: { tfaToken: string; otp: string }) =>
    apiFetch<{ user: unknown; accessToken: string; refreshToken: string }>(
      '/auth/tfa/verify-login',
      { method: 'POST', body: JSON.stringify(data), skipAuth: true },
    ),

  forgotPassword: (data: { email: string }) =>
    apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  getProfile: () => apiFetch<{ data: unknown }>('/auth/profile'),

  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    apiFetch<{ data: unknown }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),

  enableTfa: () =>
    apiFetch<{ message: string }>('/auth/tfa/enable', { method: 'POST' }),

  verifyEnableTfa: (data: { otp: string }) =>
    apiFetch<{ message: string }>('/auth/tfa/verify-enable', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  disableTfa: (data: { password: string }) =>
    apiFetch<{ message: string }>('/auth/tfa/disable', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSellers: () => apiFetch<{ data: unknown[] }>('/auth/sellers'),

  createSeller: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiFetch<{ data: unknown }>('/auth/sellers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSeller: (id: string) =>
    apiFetch<{ message: string }>(`/auth/sellers/${id}`, {
      method: 'DELETE',
    }),

  resetSellerPassword: (data: { sellerId: string; newPassword: string }) =>
    apiFetch<{ message: string }>('/auth/sellers/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Products
export const productApi = {
  list: (params?: { search?: string; category?: string; page?: number }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiFetch<{ data: unknown[]; total: number }>(
      `/products${qs ? `?${qs}` : ''}`,
    );
  },

  get: (id: string) => apiFetch<{ data: unknown }>(`/products/${id}`),

  create: (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
  }) =>
    apiFetch<{ data: unknown }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      category: string;
    }>,
  ) =>
    apiFetch<{ data: unknown }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
};

// Cart
export const cartApi = {
  get: () => apiFetch<{ data: unknown }>('/cart'),
  add: (data: { productId: string; quantity: number }) =>
    apiFetch<{ data: unknown }>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (productId: string, data: { quantity: number }) =>
    apiFetch<{ data: unknown }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (productId: string) =>
    apiFetch<{ message: string }>(`/cart/${productId}`, { method: 'DELETE' }),
  clear: () => apiFetch<{ message: string }>('/cart/clear', { method: 'POST' }),
};

// Orders
export const orderApi = {
  list: () => apiFetch<{ data: unknown[] }>('/orders'),
  get: (id: string) => apiFetch<{ data: unknown }>(`/orders/${id}`),
  checkout: (data: { cartId?: string }) =>
    apiFetch<{ url: string }>('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Payment / Connect
export const paymentApi = {
  getSettings: () => apiFetch<{ data: unknown }>('/payment/settings'),
  updateSettings: (
    data: Partial<{
      paymentEnabled: boolean;
      platformFeePercent: number;
      automaticPayoutsEnabled: boolean;
      payoutDayOfMonth: number;
    }>,
  ) =>
    apiFetch<{ data: unknown }>('/payment/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getConnectStatus: () =>
    apiFetch<{ data: unknown }>('/payment/connect/status'),
  startOnboarding: () =>
    apiFetch<{ url: string }>('/payment/connect/onboarding', {
      method: 'POST',
    }),
  getLoginLink: () =>
    apiFetch<{ url: string }>('/payment/connect/login-link', {
      method: 'POST',
    }),
  runSettlement: () =>
    apiFetch<{ message: string }>('/payment/settlement/run', {
      method: 'POST',
    }),
};

// Notifications
export const notificationApi = {
  list: () => apiFetch<{ data: unknown[] }>('/notifications'),
  markRead: (id: string) =>
    apiFetch<{ data: unknown }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  getSettings: () => apiFetch<{ data: unknown }>('/notifications/settings'),
  updateSettings: (data: { emailTypes?: string[]; socketTypes?: string[] }) =>
    apiFetch<{ data: unknown }>('/notifications/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => apiFetch<{ data: unknown }>('/analytics/dashboard'),
  getOrders: () => apiFetch<{ data: unknown }>('/analytics/orders'),
  getProducts: () => apiFetch<{ data: unknown }>('/analytics/products'),
};

// Activities
export const activityApi = {
  list: (params?: {
    actorId?: string;
    resource?: string;
    action?: string;
    page?: number;
  }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiFetch<{ data: unknown[]; total: number }>(
      `/activities${qs ? `?${qs}` : ''}`,
    );
  },
};

export { setToken, clearAuth };
