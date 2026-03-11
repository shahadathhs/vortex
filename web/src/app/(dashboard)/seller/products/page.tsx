'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi } from '@/lib/api';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.preprocess((v) => Number(v), z.number().positive()),
  stock: z.preprocess((v) => Number(v), z.number().int().min(0)),
  category: z.string(),
});
type FormData = z.infer<typeof schema>;

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const res = await productApi.list();
      return res.data as Product[];
    },
  });

  const form = useForm<FormData>({ resolver: zodResolver(schema) as never });

  const openCreate = () => {
    form.reset({ name: '', description: '', price: 0, stock: 0, category: '' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    form.reset({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category,
    });
    setEditing(p);
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: (data: FormData) => productApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setShowForm(false);
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => productApi.update(editing!._id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      setShowForm(false);
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['seller-products'] }),
  });

  const onSubmit = (data: FormData) => {
    setError('');
    if (editing) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Products</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {editing ? 'Edit product' : 'New product'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={form.handleSubmit(onSubmit as never)}
              className="space-y-3"
            >
              {(
                ['name', 'description', 'price', 'stock', 'category'] as const
              ).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type={
                      ['price', 'stock'].includes(field) ? 'number' : 'text'
                    }
                    step={field === 'price' ? '0.01' : undefined}
                    className="w-full mt-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                    {...form.register(field)}
                  />
                  {form.formState.errors[field] && (
                    <p className="text-destructive text-xs mt-0.5">
                      {form.formState.errors[field]?.message}
                    </p>
                  )}
                </div>
              ))}
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
                >
                  {editing ? 'Save changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.map((p) => (
                <tr
                  key={p._id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.category || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock === 0 ? 'text-destructive' : ''}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(p._id)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No products yet. Add your first product!
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
