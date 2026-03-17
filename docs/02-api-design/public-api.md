# Public API Design

## Overview

The public API endpoints allow guest users (unauthenticated) to browse products, categories, and brands. These endpoints are the foundation for the public storefront.

## Base URL

```
http://localhost:3000/api/public
```

## Endpoints

### Products

#### List Products

```http
GET /api/public/products
```

**Query Parameters:**

| Parameter   | Type    | Required | Default   | Description                                            |
| ----------- | ------- | -------- | --------- | ------------------------------------------------------ |
| search      | string  | No       | -         | Full-text search query                                 |
| category    | string  | No       | -         | Category slug                                          |
| brand       | string  | No       | -         | Brand slug                                             |
| sellerId    | string  | No       | -         | Filter by seller                                       |
| minPrice    | number  | No       | -         | Minimum price                                          |
| maxPrice    | number  | No       | -         | Maximum price                                          |
| minRating   | number  | No       | -         | Minimum rating (0-5)                                   |
| tags        | string  | No       | -         | Comma-separated tags                                   |
| hasVariants | boolean | No       | -         | Filter variants                                        |
| inStock     | boolean | No       | -         | In stock only                                          |
| sort        | string  | No       | createdAt | Sort field: createdAt, price, rating, name, popularity |
| order       | string  | No       | desc      | Sort order: asc, desc                                  |
| page        | number  | No       | 1         | Page number                                            |
| limit       | number  | No       | 20        | Items per page (max 100)                               |

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "slug": "wireless-headphones",
        "description": "High-quality wireless headphones",
        "shortDescription": "Premium sound with active noise cancellation",
        "price": 199.99,
        "compareAtPrice": 249.99,
        "stock": 50,
        "rating": 4.5,
        "reviewCount": 128,
        "images": [
          {
            "_id": "...",
            "url": "https://res.cloudinary.com/...",
            "alt": "Wireless Headphones",
            "isPrimary": true,
            "position": 0
          }
        ],
        "brandId": "507f1f77bcf86cd799439012",
        "primaryCategoryId": "507f1f77bcf86cd799439013",
        "tags": ["wireless", "audio", "noise-cancelling"],
        "hasVariants": false,
        "status": "active"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  },
  "message": "Products retrieved successfully"
}
```

#### Get Product by Slug

```http
GET /api/public/products/slug/:slug
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones",
    "slug": "wireless-headphones",
    "description": "Full product description...",
    "shortDescription": "Premium sound with active noise cancellation",
    "price": 199.99,
    "compareAtPrice": 249.99,
    "stock": 50,
    "rating": 4.5,
    "reviewCount": 128,
    "images": [...],
    "variants": [],
    "attributes": [
      {
        "name": "Battery Life",
        "value": "30 hours",
        "visible": true
      }
    ],
    "brand": {...},
    "primaryCategory": {...},
    "tags": ["wireless", "audio"]
  }
}
```

#### Get Related Products

```http
GET /api/public/products/:id/related?limit=8
```

Returns related products based on category, tags, or brand.

### Categories

#### List Categories

```http
GET /api/public/categories
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Electronics",
      "slug": "electronics",
      "description": "All electronic devices",
      "parentId": null,
      "level": 0,
      "path": [],
      "isActive": true,
      "showInNavbar": true,
      "displayOrder": 0,
      "productCount": 500
    }
  ]
}
```

#### Get Category by Slug

```http
GET /api/public/categories/slug/:slug
```

### Brands

#### List Brands

```http
GET /api/public/brands
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Apple",
      "slug": "apple",
      "logo": "https://...",
      "isActive": true,
      "displayOrder": 0,
      "productCount": 50
    }
  ]
}
```

#### Get Brand by Slug

```http
GET /api/public/brands/slug/:slug
```

### Search

#### Full-Text Search

```http
GET /api/public/search?q=wireless+headphones&page=1&limit=20
```

Performs full-text search across product names, descriptions, and tags.

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 25,
    "page": 1,
    "limit": 20
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (product/category/brand not found)
- `500` - Internal Server Error

## Caching

Public endpoints use caching headers:

- Products: 60 seconds
- Categories: 600 seconds (10 minutes)
- Brands: 600 seconds (10 minutes)
- Product by slug: 300 seconds (5 minutes)
- Search: 60 seconds

Clients should respect `Cache-Control` headers.

## Rate Limiting

Public endpoints are rate-limited:

- `100 requests per minute` per IP address
- Exceeding limits returns `429 Too Many Requests`

## Pagination

All list endpoints support pagination:

```http
GET /api/public/products?page=2&limit=20
```

**Response includes:**

- `products` - Array of items
- `total` - Total number of items
- `page` - Current page number
- `limit` - Items per page

**Calculate total pages:**

```javascript
const totalPages = Math.ceil(total / limit);
```

## Filtering Examples

### By Category (including subcategories)

```http
GET /api/public/products?category=electronics
```

This will include products from all subcategories of "electronics".

### By Price Range

```http
GET /api/public/products?minPrice=50&maxPrice=200
```

### By Rating

```http
GET /api/public/products?minRating=4
```

Returns products with 4+ stars.

### By Tags

```http
GET /api/public/products?tags=wireless,bluetooth
```

Returns products with ANY of the specified tags.

### In Stock Only

```http
GET /api/public/products?inStock=true
```

Returns products with stock > 0 OR allowBackorder = true.

## Sorting Examples

### Newest First

```http
GET /api/public/products?sort=createdAt&order=desc
```

### Price Low to High

```http
GET /api/public/products?sort=price&order=asc
```

### Highest Rated

```http
GET /api/public/products?sort=rating&order=desc
```

### Most Popular

```http
GET /api/public/products?sort=popularity&order=desc
```

Sorted by view count and purchase count.

## Integration with Frontend

The Next.js frontend uses these endpoints via `getPublicProducts()`, `getPublicProductBySlug()`, etc. functions in `lib/api-client.ts`.

Example:

```typescript
import { getPublicProducts } from '@/lib/api-client';

const products = await getPublicProducts({
  category: 'electronics',
  minPrice: 100,
  sort: 'rating',
  order: 'desc',
});
```
