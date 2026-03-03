import type { Request, Response } from 'express';

import { successResponse } from '@vortex/common';

import { Activity } from '../models/Activity';

export const activityController = {
  async getActivities(req: Request, res: Response) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const actorId = req.query.actorId as string | undefined;
    const resource = req.query.resource as string | undefined;
    const action = req.query.action as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

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

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(filter),
    ]);

    res.json(
      successResponse(
        {
          data: activities,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        'Activities retrieved',
      ),
    );
  },
};
