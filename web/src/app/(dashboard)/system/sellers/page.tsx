'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Key, X } from 'lucide-react';

const createSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
});

const resetSchema = z.object({ newPassword: z.string().min(8) });

type CreateData = z.infer<typeof createSchema>;
type ResetData = z.infer<typeof resetSchema>;

export default function SystemSellersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [error, setError] = useState('');

  const createForm = useForm<CreateData>({
    resolver: zodResolver(createSchema),
  });
  const resetForm = useForm<ResetData>({ resolver: zodResolver(resetSchema) });

  const loadSellers = useCallback(async () => {
    try {
      const res = (await authApi.getSellers()) as User[];
      setData(res ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSellers();
  }, [loadSellers]);

  const createSeller = async (d: CreateData) => {
    setError('');
    try {
      await authApi.createSeller(d);
      setShowCreate(false);
      createForm.reset();
      await loadSellers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      await authApi.deleteSeller(id);
      await loadSellers();
    } catch {
      // Error
    }
  };

  const resetPassword = async (d: ResetData) => {
    if (!resetTarget) return;
    setError('');
    try {
      await authApi.resetSellerPassword({
        sellerId: resetTarget._id,
        newPassword: d.newPassword,
      });
      setResetTarget(null);
      resetForm.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sellers</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> Invite seller
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Invite seller</h2>
              <button onClick={() => setShowCreate(false)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={createForm.handleSubmit(createSeller)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                {(['firstName', 'lastName'] as const).map((f) => (
                  <div key={f}>
                    <label className="text-sm font-medium capitalize">
                      {f.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                      {...createForm.register(f)}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                  {...createForm.register('email')}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                  {...createForm.register('password')}
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Create seller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                Reset password for {resetTarget.firstName}
              </h2>
              <button onClick={() => setResetTarget(null)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={resetForm.handleSubmit(resetPassword)}
              className="space-y-3"
            >
              <div>
                <label className="text-sm font-medium">New password</label>
                <input
                  type="password"
                  className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                  {...resetForm.register('newPassword')}
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetForm.formState.isSubmitting}
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((seller) => (
                <tr
                  key={seller._id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">
                    {seller.firstName} {seller.lastName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {seller.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${seller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {seller.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(seller.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setError('');
                          setResetTarget(seller);
                        }}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                        title="Reset password"
                      >
                        <Key size={14} />
                      </button>
                      <button
                        onClick={() => deleteSeller(seller._id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Delete seller"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No sellers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
