import { cookies } from 'next/headers';

const GATEWAY_URL = process.env.GATEWAY_URL ?? 'http://localhost:3000';
const API_BASE = `${GATEWAY_URL}/api`;

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

export async function apiServerFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const url = path.startsWith('/')
    ? `${API_BASE}${path}`
    : `${API_BASE}/${path}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err?.message ?? res.statusText);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return unwrapEnvelope<T>(JSON.parse(text));
}
