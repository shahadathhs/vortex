'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface ConnectStatus {
  connected: boolean;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
}

export default function SellerConnectPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['connect-status'],
    queryFn: async () => {
      const res = await paymentApi.getConnectStatus();
      return res as ConnectStatus;
    },
  });

  const onboard = useMutation({
    mutationFn: () => paymentApi.startOnboarding(),
    onSuccess: (res) => {
      window.location.href = res.url;
    },
  });

  const loginLink = useMutation({
    mutationFn: () => paymentApi.getLoginLink(),
    onSuccess: (res) => {
      window.open(res.url, '_blank');
    },
  });

  if (isLoading)
    return (
      <div className="text-center py-16 text-muted-foreground">Loading...</div>
    );

  const isFullyOnboarded = data?.detailsSubmitted && data?.chargesEnabled;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Stripe Connect</h1>
      <p className="text-muted-foreground text-sm">
        Connect your Stripe account to receive payouts for your sales.
      </p>

      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          {isFullyOnboarded ? (
            <CheckCircle size={24} className="text-green-500" />
          ) : data?.connected ? (
            <div className="w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
            </div>
          ) : (
            <XCircle size={24} className="text-muted-foreground" />
          )}
          <div>
            <p className="font-semibold">
              {isFullyOnboarded
                ? 'Account connected'
                : data?.connected
                  ? 'Onboarding incomplete'
                  : 'Not connected'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isFullyOnboarded
                ? 'You can receive payouts'
                : 'Complete onboarding to receive payouts'}
            </p>
          </div>
        </div>

        {data?.connected && (
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div
              className={`rounded-lg p-3 text-center ${data.detailsSubmitted ? 'bg-green-50' : 'bg-muted'}`}
            >
              <p className="font-medium">{data.detailsSubmitted ? '✓' : '○'}</p>
              <p className="text-xs text-muted-foreground">Details submitted</p>
            </div>
            <div
              className={`rounded-lg p-3 text-center ${data.chargesEnabled ? 'bg-green-50' : 'bg-muted'}`}
            >
              <p className="font-medium">{data.chargesEnabled ? '✓' : '○'}</p>
              <p className="text-xs text-muted-foreground">Charges enabled</p>
            </div>
            <div
              className={`rounded-lg p-3 text-center ${data.payoutsEnabled ? 'bg-green-50' : 'bg-muted'}`}
            >
              <p className="font-medium">{data.payoutsEnabled ? '✓' : '○'}</p>
              <p className="text-xs text-muted-foreground">Payouts enabled</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {!isFullyOnboarded && (
            <button
              onClick={() => onboard.mutate()}
              disabled={onboard.isPending}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {data?.connected ? 'Continue onboarding' : 'Connect with Stripe'}
            </button>
          )}
          {isFullyOnboarded && (
            <button
              onClick={() => loginLink.mutate()}
              disabled={loginLink.isPending}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <ExternalLink size={14} /> Stripe Dashboard
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
            Refresh status
          </button>
        </div>
      </div>
    </div>
  );
}
