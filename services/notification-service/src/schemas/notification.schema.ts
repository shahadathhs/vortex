import { z } from 'zod';

import { dateFilterPresetSchema, paginationQuerySchema } from '@vortex/common';

export const getNotificationsSchema = z.object({
  query: paginationQuerySchema.extend({
    unreadOnly: z.enum(['true', 'false']).optional(),
    type: z.string().optional(),
    search: z.string().optional(),
    dateFilter: dateFilterPresetSchema,
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Notification ID is required'),
  }),
});
