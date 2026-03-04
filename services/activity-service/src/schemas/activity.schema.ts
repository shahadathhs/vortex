import { z } from 'zod';

import {
  dateFilterPresetSchema,
  paginationQuerySchema,
  sortQuerySchema,
} from '@vortex/common';

export const getActivitiesSchema = z.object({
  query: paginationQuerySchema.merge(sortQuerySchema).extend({
    actorId: z.string().optional(),
    resource: z.string().optional(),
    action: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    dateFilter: dateFilterPresetSchema,
    search: z.string().optional(),
  }),
});
