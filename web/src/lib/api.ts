// All requests go to the Next.js server at the same origin (/api/*).
// next.config.ts rewrites /api/:path* → GATEWAY_URL/:path* server-side,
// so the browser never talks to the gateway directly (no CORS required).
const API_BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function isValidJwt(token: string | null): boolean {
  return (
    typeof token === 'string' &&
    token.length > 0 &&
    token !== 'undefined' &&
    token !== 'null' &&
    token.split('.').length === 3
  );
}

function setToken(token: string): void {
  if (isValidJwt(token)) {
    localStorage.setItem('accessToken', token);
  }
}

function setRefreshToken(token: string): void {
  if (typeof token === 'string' && token.length > 0) {
    localStorage.setItem('refreshToken', token);
  }
}

function clearAuth(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// Serialize refresh attempts so only one runs at a time (refresh tokens are single-use)
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!refreshRes.ok) return null;
    const refreshJson = (await refreshRes.json()) as {
      data?: { token?: string; accessToken?: string; refreshToken?: string };
      token?: string;
      accessToken?: string;
      refreshToken?: string;
    };
    const data = refreshJson?.data ?? refreshJson;
    const accessToken = data?.token ?? data?.accessToken ?? '';
    const newRefreshToken = data?.refreshToken ?? refreshToken;
    if (!accessToken) return null;
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
    return accessToken;
  } catch {
    return null;
  }
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
    if (isValidJwt(token)) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !skipAuth) {
    if (!getRefreshToken()) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    // Serialize refresh: only one refresh at a time, others wait and retry with new token
    refreshPromise ??= doRefresh().finally(() => {
      refreshPromise = null;
    });
    const accessToken = await refreshPromise;
    if (!accessToken) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    headers.Authorization = `Bearer ${accessToken}`;
    const retryRes = await fetch(`${API_BASE}${path}`, { ...init, headers });
    if (!retryRes.ok) {
      const err = (await retryRes.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(err?.message ?? retryRes.statusText);
    }
    return unwrapEnvelope<T>(await retryRes.json());
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? res.statusText);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return unwrapEnvelope<T>(JSON.parse(text));
}

// All backend responses follow { statusCode, success, message, data? }.
// Unwrap the inner `data` when present so callers receive the payload directly.
function unwrapEnvelope<T>(json: unknown): T {
  if (
    json !== null &&
    typeof json === 'object' &&
    'data' in json &&
    (json as Record<string, unknown>).data !== undefined
  ) {
    return (json as Record<string, unknown>).data as T;
  }
  return json as T;
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

  getProfile: () => apiFetch<unknown>('/auth/profile'),

  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    apiFetch<unknown>('/auth/profile', {
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

  getSellers: () => apiFetch<unknown[]>('/auth/sellers'),

  createSeller: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) =>
    apiFetch<unknown>('/auth/sellers', {
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
    return apiFetch<unknown[]>(`/products${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => apiFetch<unknown>(`/products/${id}`),

  create: (data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
  }) =>
    apiFetch<unknown>('/products', {
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
    apiFetch<unknown>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
};

// Cart
export const cartApi = {
  get: () => apiFetch<unknown>('/cart'),
  add: (data: { productId: string; quantity: number }) =>
    apiFetch<unknown>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (productId: string, data: { quantity: number }) =>
    apiFetch<unknown>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (productId: string) =>
    apiFetch<{ message: string }>(`/cart/${productId}`, { method: 'DELETE' }),
  clear: () => apiFetch<{ message: string }>('/cart/clear', { method: 'POST' }),
};

// Orders
export const orderApi = {
  list: () => apiFetch<unknown[]>('/orders'),
  get: (id: string) => apiFetch<unknown>(`/orders/${id}`),
  checkout: (data: { cartId?: string }) =>
    apiFetch<{ url: string }>('/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Payment / Connect
export const paymentApi = {
  getSettings: () => apiFetch<unknown>('/payment/settings'),
  updateSettings: (
    data: Partial<{
      paymentEnabled: boolean;
      platformFeePercent: number;
      automaticPayoutsEnabled: boolean;
      payoutDayOfMonth: number;
    }>,
  ) =>
    apiFetch<unknown>('/payment/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getConnectStatus: () => apiFetch<unknown>('/payment/connect/status'),
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
  list: () => apiFetch<unknown[]>('/notifications'),
  markRead: (id: string) =>
    apiFetch<unknown>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  getSettings: () => apiFetch<unknown>('/notifications/settings'),
  updateSettings: (data: { emailTypes?: string[]; socketTypes?: string[] }) =>
    apiFetch<unknown>('/notifications/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => apiFetch<unknown>('/analytics/dashboard'),
  getOrders: () => apiFetch<unknown>('/analytics/orders'),
  getProducts: () => apiFetch<unknown>('/analytics/products'),
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
    return apiFetch<unknown[]>(`/activities${qs ? `?${qs}` : ''}`);
  },
};

export { setToken, setRefreshToken, clearAuth };
