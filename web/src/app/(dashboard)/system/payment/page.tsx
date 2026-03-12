'use client';

import { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '@/lib/api';
import { PaymentSettings } from '@/types';
import { Zap } from 'lucide-react';

export default function SystemPaymentPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [settleMsg, setSettleMsg] = useState('');
  const [settleError, setSettleError] = useState('');
  const [settleLoading, setSettleLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = (await paymentApi.getSettings()) as PaymentSettings;
      setSettings(res);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateSettings = async (patch: Partial<PaymentSettings>) => {
    try {
      await paymentApi.updateSettings(patch);
      await loadSettings();
    } catch {
      // Error
    }
  };

  const runSettlement = async () => {
    setSettleMsg('');
    setSettleError('');
    setSettleLoading(true);
    try {
      const res = await paymentApi.runSettlement();
      setSettleMsg(res.message);
    } catch (e) {
      setSettleError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSettleLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-16 text-muted-foreground">Loading...</div>
    );

  const s = settings;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Payment Settings</h1>

      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Payments enabled</p>
            <p className="text-sm text-muted-foreground">
              Allow buyers to checkout
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({ paymentEnabled: !s?.paymentEnabled })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${s?.paymentEnabled ? 'bg-primary' : 'bg-muted'}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s?.paymentEnabled ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Automatic payouts</p>
            <p className="text-sm text-muted-foreground">
              Run settlement automatically
            </p>
          </div>
          <button
            onClick={() =>
              updateSettings({
                automaticPayoutsEnabled: !s?.automaticPayoutsEnabled,
              })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${s?.automaticPayoutsEnabled ? 'bg-primary' : 'bg-muted'}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s?.automaticPayoutsEnabled ? 'translate-x-5' : ''}`}
            />
          </button>
        </div>

        <div>
          <label className="font-medium block mb-1">Platform fee (%)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={s?.platformFeePercent}
              key={s?.platformFeePercent}
              id="fee-input"
              className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                const val = parseFloat(
                  (document.getElementById('fee-input') as HTMLInputElement)
                    .value,
                );
                if (!isNaN(val))
                  void updateSettings({ platformFeePercent: val });
              }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Save
            </button>
          </div>
        </div>

        <div>
          <label className="font-medium block mb-1">Payout day of month</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="28"
              defaultValue={s?.payoutDayOfMonth}
              key={s?.payoutDayOfMonth}
              id="day-input"
              className="w-24 rounded-md border bg-transparent px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                const val = parseInt(
                  (document.getElementById('day-input') as HTMLInputElement)
                    .value,
                );
                if (!isNaN(val)) void updateSettings({ payoutDayOfMonth: val });
              }}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-3">
        <h2 className="font-semibold">Manual Settlement</h2>
        <p className="text-sm text-muted-foreground">
          Run the settlement process immediately for all pending transactions.
        </p>
        {settleMsg && <p className="text-green-600 text-sm">{settleMsg}</p>}
        {settleError && (
          <p className="text-destructive text-sm">{settleError}</p>
        )}
        <button
          onClick={runSettlement}
          disabled={settleLoading}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Zap size={16} />
          {settleLoading ? 'Running...' : 'Run settlement now'}
        </button>
      </div>
    </div>
  );
}
