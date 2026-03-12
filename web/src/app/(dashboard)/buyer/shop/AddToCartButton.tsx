'use client';

import { useState } from 'react';
import { addToCartAction } from './actions';

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (stock === 0 || added || loading) return;
    setLoading(true);
    try {
      await addToCartAction(productId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // Error - could toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={stock === 0 || added || loading}
      className="w-full rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {added ? 'Added!' : stock === 0 ? 'Out of stock' : 'Add to cart'}
    </button>
  );
}
