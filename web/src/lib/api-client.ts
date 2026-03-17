/**
 * API Client for Public Endpoints
 * These functions call the public API routes that don't require authentication
 */

import { Product, PaginatedResponse, Category, Brand } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Get public products with optional filters
 */
export async function getPublicProducts(
  params: Record<string, string> = {},
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}/api/public/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

/**
 * Get product by slug
 */
export async function getPublicProductBySlug(
  slug: string,
): Promise<ApiResponse<Product | null>> {
  const response = await fetch(`${API_URL}/api/public/products/slug/${slug}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    return { success: false, data: null, message: 'Product not found' };
  }

  return response.json();
}

/**
 * Get all categories
 */
export async function getPublicCategories(): Promise<ApiResponse<Category[]>> {
  const response = await fetch(`${API_URL}/api/public/categories`, {
    next: { revalidate: 600 }, // Cache for 10 minutes
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

/**
 * Get category by slug
 */
export async function getPublicCategoryBySlug(
  slug: string,
): Promise<ApiResponse<Category | null>> {
  const response = await fetch(
    `${API_URL}/api/public/categories/slug/${slug}`,
    {
      next: { revalidate: 600 },
    },
  );

  if (!response.ok) {
    return { success: false, data: null, message: 'Category not found' };
  }

  return response.json();
}

/**
 * Get all brands
 */
export async function getPublicBrands(): Promise<ApiResponse<Brand[]>> {
  const response = await fetch(`${API_URL}/api/public/brands`, {
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }

  return response.json();
}

/**
 * Get brand by slug
 */
export async function getPublicBrandBySlug(
  slug: string,
): Promise<ApiResponse<Brand | null>> {
  const response = await fetch(`${API_URL}/api/public/brands/slug/${slug}`, {
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    return { success: false, data: null, message: 'Brand not found' };
  }

  return response.json();
}

/**
 * Get related products
 */
export async function getRelatedProducts(
  productId: string,
  limit = 8,
): Promise<ApiResponse<Product[]>> {
  const response = await fetch(
    `${API_URL}/api/public/products/${productId}/related?limit=${limit}`,
    {
      next: { revalidate: 180 }, // Cache for 3 minutes
    },
  );

  if (!response.ok) {
    return {
      success: false,
      data: [],
      message: 'Failed to fetch related products',
    };
  }

  return response.json();
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  page = 1,
  limit = 20,
): Promise<ApiResponse<{ products: Product[]; total: number }>> {
  const response = await fetch(
    `${API_URL}/api/public/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!response.ok) {
    return {
      success: false,
      data: { products: [], total: 0 },
      message: 'Search failed',
    };
  }

  return response.json();
}
