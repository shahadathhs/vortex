# Product API Design

## Overview

The Product API handles all product-related operations including CRUD operations, variant management, inventory tracking, and bulk operations for sellers.

## Product Management Endpoints

### Create Product

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "shortDescription": "Premium sound with active noise cancellation",
  "price": 199.99,
  "compareAtPrice": 249.99,
  "stock": 100,
  "categoryIds": ["cat123", "cat456"],
  "primaryCategoryId": "cat123",
  "tags": ["wireless", "audio", "noise-cancelling"],
  "brandId": "brand789",
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "alt": "Wireless headphones",
      "isPrimary": true,
      "position": 0,
      "width": 800,
      "height": 800
    }
  ],
  "variants": [
    {
      "name": "Black",
      "sku": "WH-BLK",
      "price": 199.99,
      "stock": 50,
      "options": [
        { "name": "Color", "value": "Black" }
      ],
      "isDefault": true
    }
  ],
  "attributes": [
    {
      "name": "Battery Life",
      "value": "30 hours",
      "visible": true
    }
  ],
  "hasVariants": true,
  "variantType": "color",
  "allowBackorder": false,
  "trackInventory": true,
  "taxable": true,
  "requiresShipping": true,
  "weight": 250,
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "prod123",
    "name": "Wireless Headphones",
    "slug": "wireless-headphones",
    ...
  },
  "message": "Product created successfully"
}
```

### Get Products (Seller)

```http
GET /api/products
Authorization: Bearer <token>
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: 'draft' | 'active' | 'archived' | 'out_of_stock'
  - search: string
  - category: string
  - sort: 'createdAt' | 'price' | 'name' | 'stock'
  - order: 'asc' | 'desc'

Response:
{
  "success": true,
  "data": {
    "products": [...],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### Get Product by ID

```http
GET /api/products/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "prod123",
    "name": "Wireless Headphones",
    "slug": "wireless-headphones",
    "description": "...",
    "images": [...],
    "variants": [...],
    "attributes": [...],
    ...
  }
}
```

### Update Product

```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 179.99,
  "stock": 80,
  "status": "active"
}

Response:
{
  "success": true,
  "data": {...},
  "message": "Product updated successfully"
}
```

### Delete Product

```http
DELETE /api/products/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Variant Management Endpoints

### Create Variant

```http
POST /api/products/:productId/variants
Authorization: Bearer <token>

{
  "name": "White",
  "sku": "WH-WHT",
  "price": 199.99,
  "stock": 30,
  "options": [
    { "name": "Color", "value": "White" }
  ],
  "image": {
    "url": "https://...",
    "alt": "White headphones",
    "isPrimary": false,
    "position": 1,
    "width": 800,
    "height": 800
  },
  "isDefault": false
}
```

### Update Variant

```http
PUT /api/products/:productId/variants/:variantId
Authorization: Bearer <token>

{
  "stock": 25,
  "price": 189.99
}
```

### Delete Variant

```http
DELETE /api/products/:productId/variants/:variantId
Authorization: Bearer <token>
```

### Bulk Update Variants

```http
PATCH /api/products/:productId/variants
Authorization: Bearer <token>

{
  "updates": [
    {
      "variantId": "var123",
      "changes": {
        "stock": 50,
        "price": 179.99
      }
    },
    {
      "variantId": "var456",
      "changes": {
        "stock": 0
      }
    }
  ]
}
```

## Inventory Management Endpoints

### Get Inventory Summary

```http
GET /api/seller/inventory
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalStock": 5000,
    "lowStockCount": 12,
    "outOfStockCount": 3,
    "categories": [...],
    "recentMovements": [...]
  }
}
```

### Get Inventory Alerts

```http
GET /api/seller/inventory/alerts
Authorization: Bearer <token>

Query Parameters:
  - type: 'low_stock' | 'out_of_stock' | 'overstock'
  - status: 'active' | 'resolved' | 'dismissed'

Response:
{
  "success": true,
  "data": {
    "alerts": [
      {
        "_id": "alert123",
        "productId": "prod123",
        "productName": "Wireless Headphones",
        "variantName": "Black",
        "alertType": "low_stock",
        "currentStock": 3,
        "threshold": 10,
        "status": "active",
        "createdAt": "2024-06-01T10:00:00Z"
      }
    ]
  }
}
```

### Manual Stock Adjustment

```http
POST /api/seller/inventory/adjustment
Authorization: Bearer <token>

{
  "productId": "prod123",
  "variantId": "var123",
  "quantity": -5,
  "reason": "damaged",
  "notes": "Damaged during shipping"
}

Response:
{
  "success": true,
  "data": {
    "productId": "prod123",
    "previousStock": 50,
    "newStock": 45,
    "movementId": "mov123"
  }
}
```

### Get Inventory Movements

```http
GET /api/seller/inventory/movements
Authorization: Bearer <token>

Query Parameters:
  - productId: string
  - type: 'sale' | 'restock' | 'adjustment' | 'return'
  - startDate: ISO Date
  - endDate: ISO Date
  - page: number
  - limit: number

Response:
{
  "success": true,
  "data": {
    "movements": [
      {
        "_id": "mov123",
        "productId": "prod123",
        "variantName": "Black",
        "type": "sale",
        "quantity": -2,
        "previousStock": 50,
        "newStock": 48,
        "referenceType": "order",
        "referenceId": "order456",
        "notes": "Customer purchase",
        "performedBy": "user123",
        "createdAt": "2024-06-01T10:00:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

## Bulk Operations Endpoints

### Bulk Product Upload

```http
POST /api/seller/products/bulk
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  - file: (CSV or Excel file)
  - options: JSON string with updateExisting, defaultStatus, createCategories, createBrands

Response:
{
  "success": true,
  "data": {
    "uploadId": "upl123",
    "status": "parsing",
    "message": "File uploaded successfully"
  }
}
```

### Get Upload Progress

```http
GET /api/seller/products/bulk/:uploadId/progress
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "status": "processing",
    "stage": "validating",
    "progress": 45,
    "totalRows": 1000,
    "processedRows": 450,
    "errors": [
      {
        "row": 25,
        "field": "price",
        "message": "Invalid price format"
      }
    ]
  }
}
```

### Bulk Update Products

```http
PATCH /api/seller/products/bulk
Authorization: Bearer <token>

{
  "productIds": ["prod123", "prod456", "prod789"],
  "updates": {
    "status": "active",
    "stock": 50
  }
}

Response:
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "results": [...]
  }
}
```

### Bulk Delete Products

```http
DELETE /api/seller/products/bulk
Authorization: Bearer <token>

{
  "productIds": ["prod123", "prod456"],
  "reason": "Products discontinued"
}

Response:
{
  "success": true,
  "message": "2 products deleted successfully"
}
```

## Category Management Endpoints

### Create Category

```http
POST /api/categories
Authorization: Bearer <token> (Admin only)

{
  "name": "Electronics",
  "slug": "electronics",
  "description": "All electronic devices",
  "parentId": null,
  "image": {
    "url": "https://...",
    "alt": "Electronics"
  },
  "isActive": true,
  "showInNavbar": true,
  "displayOrder": 0
}
```

### Get Category Tree

```http
GET /api/categories/tree
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "_id": "cat123",
      "name": "Electronics",
      "slug": "electronics",
      "children": [
        {
          "_id": "cat456",
          "name": "Computers",
          "slug": "computers",
          "children": [...]
        }
      ]
    }
  ]
}
```

### Update Category

````http
PUT /api/categories/:id
Authorization: Bearer <token> (Admin only)

### Delete Category

```http
DELETE /api/categories/:id
Authorization: Bearer <token> (Admin only)

## Brand Management Endpoints

### Create Brand

```http
POST /api/brands
Authorization: Bearer <token> (Admin only)

{
  "name": "Apple",
  "slug": "apple",
  "description": "Technology company",
  "logo": "https://...",
  "website": "https://apple.com",
  "isActive": true
}
````

### Get Brands

````http
GET /api/brands
Authorization: Bearer <token>

### Update Brand

```http
PUT /api/brands/:id
Authorization: Bearer <token> (Admin only)

### Delete Brand

```http
DELETE /api/brands/:id
Authorization: Bearer <token> (Admin only)

## Image Upload Endpoints

### Upload Product Image

```http
POST /api/seller/products/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  - file: Image file
  - productId: string (optional - associate with product)

Response:
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/vortex/image.jpg",
    "publicId": "vortex/product123",
    "width": 800,
    "height": 800,
    "format": "jpg",
    "size": 125000
  }
}
````

### Bulk Image Upload

```http
POST /api/seller/products/bulk/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  - products: JSON string mapping SKUs to product IDs
  - images: Multiple image files

Response:
{
  "success": true,
  "data": {
    "uploadId": "bulk123",
    "total": 50,
    "uploaded": 50,
    "failed": 0,
    "results": [...]
  }
}
```

## Analytics Endpoints

### Get Product Analytics

```http
GET /api/seller/analytics/products
Authorization: Bearer <token>

Query Parameters:
  - period: 'today' | 'week' | 'month' | 'quarter' | 'year'
  - startDate: ISO Date
  - endDate: ISO Date
  - limit: number (default: 10)

Response:
{
  "success": true,
  "data": {
    "topProducts": [
      {
        "productId": "prod123",
        "productName": "Wireless Headphones",
        "views": 1500,
        "purchases": 150,
        "revenue": 29998.50,
        "conversionRate": 10
      }
    ],
    "lowPerforming": [...],
    "outOfStock": [...],
    "categoryBreakdown": [...]
  }
}
```

### Get Revenue Analytics

```http
GET /api/seller/analytics/revenue
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-06-01T00:00:00Z",
      "end": "2024-06-30T23:59:59Z"
    },
    "totalRevenue": 150000,
    "orderCount": 500,
    "averageOrderValue": 300,
    "growth": {
      "revenue": 15.5,
      "orders": 8.2
    },
    "dailyRevenue": [
      { "date": "2024-06-01", "revenue": 4500 },
      { "date": "2024-06-02", "revenue": 5200 }
    ],
    "categoryBreakdown": [...],
    "productBreakdown": [...]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found",
    "details": {}
  }
}
```

### Common Error Codes

- `PRODUCT_NOT_FOUND` - Product doesn't exist
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User doesn't have permission
- `VALIDATION_ERROR` - Invalid input data
- `OUT_OF_STOCK` - Product out of stock
- `DUPLICATE_SLUG` - Slug already exists
- `BULK_UPLOAD_FAILED` - Bulk upload processing failed
- `INVALID_FILE_TYPE` - Invalid file type for upload

## Permission Requirements

| Endpoint                  | Seller   | Admin | System |
| ------------------------- | -------- | ----- | ------ |
| GET /api/products         | Own only | All   | All    |
| POST /api/products        | Yes      | Yes   | Yes    |
| PUT /api/products/:id     | Own only | All   | All    |
| DELETE /api/products/:id  | Own only | All   | All    |
| POST /api/products/bulk   | Yes      | Yes   | Yes    |
| POST /api/categories      | No       | Yes   | Yes    |
| POST /api/brands          | No       | Yes   | Yes    |
| GET /api/seller/analytics | Yes      | Yes   | Yes    |

## Rate Limiting

```
GET /api/products           : 100 requests/hour
POST /api/products          : 20 requests/hour
PUT /api/products/:id       : 50 requests/hour
DELETE /api/products/:id    : 20 requests/hour
POST /api/products/bulk    : 5 requests/hour
POST /api/seller/analytics : 60 requests/hour
```

## Webhooks

### Product Events

```typescript
// Product Created
{
  event: 'product.created'
  productId: string;
  sellerId: string;
  name: string;
  slug: string;
  price: number;
  createdAt: Date;
}

// Product Updated
{
  event: 'product.updated'
  productId: string;
  sellerId: string;
  changes: {
    price?: { from: number; to: number };
    stock?: { from: number; to: number };
    status?: { from: string; to: string };
  };
  updatedAt: Date;
}

// Product Deleted
{
  event: 'product.deleted'
  productId: string;
  sellerId: string;
  deletedAt: Date;
}

// Low Stock Alert
{
  event: 'product.low_stock'
  productId: string;
  sellerId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  variantId?: string;
  variantName?: string;
  triggeredAt: Date;
}

// Out of Stock
{
  event: 'product.out_of_stock'
  productId: string;
  sellerId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  triggeredAt: Date;
}
```
