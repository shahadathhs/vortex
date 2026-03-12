'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';

const schema = z.object({
  otp: z
    .string()
    .length(6, 'Must be exactly 6 digits')
    .regex(/^\d+$/, 'Digits only'),
});
type FormData = z.infer<typeof schema>;

export default function TfaPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const tfaToken = sessionStorage.getItem('tfaToken');
    if (!tfaToken) {
      setError('Session expired. Please log in again.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.verifyTfaLogin({ tfaToken, otp: data.otp });
      const { user, token, refreshToken } = res as unknown as {
        user: User;
        token: string;
        refreshToken: string;
      };
      sessionStorage.removeItem('tfaToken');
      login(user, token, refreshToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Two-factor authentication</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">OTP Code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm text-center tracking-[0.5em] text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            {...register('otp')}
          />
          {errors.otp && (
            <p className="text-destructive text-xs">{errors.otp.message}</p>
          )}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
