import type { Request, Response } from 'express';

import {
  getDateRangeFromPreset,
  getPagination,
  buildSearchOr,
  successPaginatedResponse,
} from '@vortex/common';

import { Activity } from '../models/Activity';

export const activityController = {
  async getActivities(req: Request, res: Response) {
    const { page, limit, skip } = getPagination(req.query);
    const actorId = req.query.actorId as string | undefined;
    const resource = req.query.resource as string | undefined;
    const action = req.query.action as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const dateFilter = req.query.dateFilter as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder as string | undefined;

    const filter: Record<string, unknown> = {};

    if (actorId) filter.actorId = actorId;
    if (resource) filter.resource = resource;
    if (action) filter.action = action;

    if (from || to) {
      filter.timestamp = {};
      if (from)
        (filter.timestamp as Record<string, Date>).$gte = new Date(from);
      if (to) (filter.timestamp as Record<string, Date>).$lte = new Date(to);
    }

    const dateRange = dateFilter ? getDateRangeFromPreset(dateFilter) : null;
    if (dateRange) {
      filter.timestamp = filter.timestamp ?? {};
      (filter.timestamp as Record<string, Date>).$gte = dateRange.from;
      (filter.timestamp as Record<string, Date>).$lte = dateRange.to;
    }

    if (search?.trim()) {
      const searchOr = buildSearchOr(['actorId', 'resource', 'action'], search);
      if (searchOr) Object.assign(filter, searchOr);
    }

    const sortField =
      sortBy && ['actorId', 'resource', 'action', 'timestamp'].includes(sortBy)
        ? sortBy
        : 'timestamp';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .select('-__v')
        .sort({ [sortField]: sortDir } as Record<string, 1 | -1>)
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    res.json(
      successPaginatedResponse(
        activities,
        { page, limit, total },
        'Activities retrieved',
      ),
    );
  },
};
