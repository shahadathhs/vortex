# Search & Filtering API Design

## Overview

The search API provides full-text search, advanced filtering, and sorting capabilities for products, categories, and brands across the Vortex platform.

## Search Endpoints

### Full-Text Search

```typescript
// Global search
GET    /api/search
Query: {
  q: string;                    // Search query
  type?: 'all' | 'products' | 'categories' | 'brands';
  page?: number;
  limit?: number;
}

Response: {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    rating: number;
    category: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  suggestions: string[];        // Auto-complete suggestions
  totalResults: {
    products: number;
    categories: number;
    brands: number;
  };
}

// Product search
GET    /api/search/products
Query: {
  q?: string;                   // Optional query
  category?: string;             // Category slug
  brand?: string;                // Brand slug
  tags?: string;                 // Comma-separated
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  hasImages?: boolean;
  hasVariants?: boolean;
  sort?: 'relevance' | 'price' | 'rating' | 'newest' | 'popularity';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Category search
GET    /api/search/categories
Query: {
  q?: string;
  parentId?: string;             // Search within parent
  isActive?: boolean;
}

// Brand search
GET    /api/search/brands
Query: {
  q?: string;
  isActive?: boolean;
  minProducts?: number;          // Minimum product count
}
```

### Auto-Complete / Suggestions

```typescript
// Search suggestions
GET    /api/search/suggestions
Query: { q: string }
Response: {
  query: string;
  suggestions: {
    products: Array<{
      id: string;
      name: string;
      slug: string;
      image: string;
    }>;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    brands: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    searches: string[];          // Popular searches
  };
}
```

### Recent & Trending Searches

```typescript
// Recent searches (user-specific)
GET    /api/search/recent
Response: {
  searches: string[];
}

// Trending searches (platform-wide)
GET    /api/search/trending
Query: { period?: 'day' | 'week' | 'month' }
Response: {
  trending: Array<{
    query: string;
    count: number;
    change: number;              // Change from previous period
  }>;
}

// Popular products
GET    /api/search/popular
Query: { period?: 'day' | 'week' | 'month'; limit?: number }
Response: {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    views: number;
    purchases: number;
  }>;
}
```

## Advanced Filtering

### Filter Options

```typescript
// Get available filters for a search
GET    /api/search/filters
Query: { q?: string; category?: string }
Response: {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
    subcategories?: Array<{
      id: string;
      name: string;
      slug: string;
      count: number;
    }>;
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
  };
  ratings: Array<{
    rating: number;
    count: number;
  }>;
  tags: Array<{
    tag: string;
    count: number;
  }>;
  attributes: Array<{
    name: string;
    values: Array<{
      value: string;
      count: number;
    }>;
  }>;
}
```

### Faceted Search

```typescript
// Search with facets
POST   /api/search/faceted
Body: {
  query?: string;
  filters: {
    categories?: string[];      // Category IDs
    brands?: string[];          // Brand IDs
    priceRange?: { min: number; max: number };
    rating?: number;            // Minimum rating
    tags?: string[];
    inStock?: boolean;
    attributes?: Array<{
      name: string;
      values: string[];
    }>;
  };
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
Response: {
  products: Array<IProduct>;
  total: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
    ratings: Array<{ rating: number; count: number }>;
    tags: Array<{ tag: string; count: number }>;
  };
  appliedFilters: any;
}
```

## Sorting Options

### Product Sorting

```typescript
interface SortOption {
  key: string;
  label: string;
  fields: string | string[];
  order: 1 | -1;
  available: boolean;
}

const sortOptions: SortOption[] = [
  {
    key: 'relevance',
    label: 'Relevance',
    fields: ['score'], // MongoDB text search score
    order: -1,
    available: true, // Only with search query
  },
  {
    key: 'price_asc',
    label: 'Price: Low to High',
    fields: 'price',
    order: 1,
    available: true,
  },
  {
    key: 'price_desc',
    label: 'Price: High to Low',
    fields: 'price',
    order: -1,
    available: true,
  },
  {
    key: 'rating',
    label: 'Customer Rating',
    fields: 'rating',
    order: -1,
    available: true,
  },
  {
    key: 'newest',
    label: 'Newest Arrivals',
    fields: 'createdAt',
    order: -1,
    available: true,
  },
  {
    key: 'popularity',
    label: 'Most Popular',
    fields: ['viewCount', 'purchaseCount'],
    order: -1,
    available: true,
  },
  {
    key: 'best_selling',
    label: 'Best Selling',
    fields: 'purchaseCount',
    order: -1,
    available: true,
  },
  {
    key: 'name_asc',
    label: 'Name: A to Z',
    fields: 'name',
    order: 1,
    available: true,
  },
  {
    key: 'name_desc',
    label: 'Name: Z to A',
    fields: 'name',
    order: -1,
    available: true,
  },
];
```

## Search Analytics

### Tracking Search Behavior

```typescript
// Track search (for analytics)
POST   /api/search/track
Body: {
  query: string;
  resultsCount: number;
  filters?: any;
  userId?: string;
  sessionId?: string;
}

// Track search result click
POST   /api/search/track/click
Body: {
  searchId: string;              // From search response
  productId: string;
  position: number;              // Position in results
  userId?: string;
}

// Track zero-results search
POST   /api/search/track/zero-results
Body: {
  query: string;
  filters?: any;
  userId?: string;
}

// Search analytics dashboard (admin)
GET    /api/analytics/search
Query: { period?: 'day' | 'week' | 'month' }
Response: {
  topSearches: Array<{
    query: string;
    count: number;
    zeroResults: number;
  }>;
  topZeroResultSearches: Array<{
    query: string;
    count: number;
  }>;
  clickThroughRate: number;
  averageResults: number;
};
```

## Implementation Notes

### MongoDB Text Index

```javascript
// Product text index
productSchema.index(
  {
    name: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text',
    sku: 'text',
  },
  {
    weights: {
      name: 10,
      sku: 8,
      tags: 5,
      shortDescription: 3,
      description: 2,
    },
    name: 'product_text_index',
  },
);
```

### Search Query Building

```typescript
function buildSearchQuery(params: SearchParams) {
  const query: any = {
    status: 'active',
    deletedAt: null,
  };

  // Text search
  if (params.q) {
    query.$text = { $search: params.q };
  }

  // Category filter
  if (params.category) {
    const category = await Category.findOne({ slug: params.category });
    if (category) {
      const descendants = await Category.getDescendants(category._id);
      const categoryIds = [category._id, ...descendants.map((c) => c._id)];
      query.categoryIds = { $in: categoryIds };
    }
  }

  // Brand filter
  if (params.brand) {
    const brand = await Brand.findOne({ slug: params.brand });
    if (brand) {
      query.brandId = brand._id;
    }
  }

  // Price range
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    query.price = {};
    if (params.minPrice !== undefined) {
      query.price.$gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      query.price.$lte = params.maxPrice;
    }
  }

  // Rating filter
  if (params.minRating !== undefined) {
    query.rating = { $gte: params.minRating };
  }

  // Tags filter
  if (params.tags) {
    const tagsArray = Array.isArray(params.tags)
      ? params.tags
      : params.tags.split(',');
    query.tags = { $in: tagsArray };
  }

  // Stock filter
  if (params.inStock) {
    query.$or = [{ stock: { $gt: 0 } }, { allowBackorder: true }];
  }

  return query;
}
```

### Sorting Implementation

```typescript
function buildSortOption(sort: string, order: 'asc' | 'desc') {
  const sortMap = {
    relevance: { score: { $meta: 'textScore' } },
    price: { price: order === 'asc' ? 1 : -1 },
    rating: { rating: order === 'asc' ? 1 : -1 },
    newest: { createdAt: order === 'asc' ? 1 : -1 },
    popularity: {
      viewCount: order === 'asc' ? 1 : -1,
      purchaseCount: order === 'asc' ? 1 : -1,
    },
    best_selling: { purchaseCount: order === 'asc' ? 1 : -1 },
    name: { name: order === 'asc' ? 1 : -1 },
  };

  return sortMap[sort] || sortMap.newest;
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache search results
async function searchWithCache(params: SearchParams) {
  const cacheKey = `search:${JSON.stringify(params)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Perform search
  const results = await performSearch(params);

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(results));

  return results;
}

// Cache popular searches
async function getPopularSearches() {
  const cacheKey = 'search:popular';

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const trending = await SearchTracking.aggregate([
    {
      $group: {
        _id: '$query',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  await redis.setex(cacheKey, 3600, JSON.stringify(trending)); // 1 hour

  return trending;
}
```

### Search Result Pagination

```typescript
interface PaginatedResults<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

async function paginateSearch<T>(
  query: any,
  options: { page: number; limit: number; sort: any },
): Promise<PaginatedResults<T>> {
  const { page, limit, sort } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
```

## Future Enhancements

### Elasticsearch Integration

For large-scale deployments (100k+ products), consider:

```typescript
// Elasticsearch client
const { Client } = require('@elastic/elasticsearch');
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Search with Elasticsearch
async function elasticsearchSearch(params: SearchParams) {
  const { body } = await client.search({
    index: 'products',
    body: {
      query: {
        bool: {
          must: [
            { match: { status: 'active' } },
            ...(params.q
              ? [
                  {
                    multi_match: {
                      query: params.q,
                      fields: ['name^3', 'description', 'tags'],
                    },
                  },
                ]
              : []),
          ],
          filter: [
            ...(params.category
              ? [
                  {
                    term: { categoryIds: params.category },
                  },
                ]
              : []),
            ...(params.brand
              ? [
                  {
                    term: { brandId: params.brand },
                  },
                ]
              : []),
            ...(params.minPrice || params.maxPrice
              ? [
                  {
                    range: {
                      price: {
                        ...(params.minPrice && { gte: params.minPrice }),
                        ...(params.maxPrice && { lte: params.maxPrice }),
                      },
                    },
                  },
                ]
              : []),
          ],
        },
      },
      sort: buildSort(params.sort, params.order),
      from: (params.page - 1) * params.limit,
      size: params.limit,
      aggs: {
        categories: { terms: { field: 'categoryIds' } },
        brands: { terms: { field: 'brandId' } },
        price_ranges: {
          range: {
            field: 'price',
            ranges: [
              { to: 50 },
              { from: 50, to: 100 },
              { from: 100, to: 200 },
              { from: 200 },
            ],
          },
        },
      },
    },
  });

  return formatElasticsearchResults(body);
}
```

### Synonyms and Fuzzy Search

```typescript
// Synonym mapping
const synonyms = {
  sneakers: ['trainers', 'kicks', 'shoes'],
  cellphone: ['mobile', 'phone', 'smartphone'],
  laptop: ['notebook', 'computer'],
};

// Fuzzy search (typo tolerance)
async function fuzzySearch(query: string) {
  return Product.find({
    $text: {
      $search: query,
      $caseSensitive: false,
    },
  })
    .addFields({
      score: { $meta: 'textScore' },
    })
    .sort({ score: { $meta: 'textScore' } });
}
```

### Did You Mean?

```typescript
// Suggest corrections for misspelled queries
async function suggestCorrection(query: string) {
  // Find similar product names
  const similar = await Product.aggregate([
    {
      $match: {
        name: {
          $regex: query.split('').join('.{0,2}'), // Allow 2 chars between each
          $options: 'i',
        },
      },
    },
    { $limit: 5 },
    {
      $group: {
        _id: '$name',
        count: { $sum: 1 },
      },
    },
  ]);

  return similar.map((s) => s._id);
}
```
