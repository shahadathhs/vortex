import { z } from 'zod';

import { dateFilterPresetSchema } from '@vortex/common';

const groupBySchema = z.enum(['status', 'seller', 'category']).optional();

export const getDashboardSchema = z.object({
  query: z.object({
    dateFilter: dateFilterPresetSchema,
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
    groupBy: groupBySchema,
  }),
});

export const getAnalyticsOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    dateFilter: dateFilterPresetSchema,
    status: z.string().optional(),
  }),
});

export const getAnalyticsProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    category: z.string().optional(),
  }),
});
