import {
  AuthRequest,
  buildSearchOr,
  ForbiddenError,
  getDateRangeFromPreset,
  getPagination,
  NotFoundError,
  successPaginatedResponse,
  successResponse,
} from '@vortex/common';
import { Response } from 'express';

import { Notification } from '../models/Notification';

export const notificationController = {
  async getNotifications(req: AuthRequest, res: Response) {
    const user = req.user!;
    const { page, limit, skip } = getPagination(req.query);
    const unreadOnly = req.query.unreadOnly === 'true';
    const type = req.query.type as string | undefined;
    const search = req.query.search as string | undefined;
    const dateFilter = req.query.dateFilter as string | undefined;

    const filter: Record<string, unknown> = {};

    if (user.role === 'system') {
      filter.$or = [
        { recipientRole: 'system' },
        { recipientId: null, recipientRole: { $exists: false } },
      ];
    } else {
      filter.recipientId = user.id;
    }

    if (unreadOnly) filter.read = false;
    if (type) filter.type = type;

    const dateRange = dateFilter ? getDateRangeFromPreset(dateFilter) : null;
    if (dateRange) {
      filter.createdAt = {
        $gte: dateRange.from,
        $lte: dateRange.to,
      };
    }

    if (search?.trim()) {
      const searchOr = buildSearchOr(['type'], search);
      if (searchOr) Object.assign(filter, searchOr);
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json(
      successPaginatedResponse(
        notifications,
        { page, limit, total },
        'Notifications retrieved',
      ),
    );
  },

  async markAsRead(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const user = req.user!;

    const notification = await Notification.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (user.role !== 'system') {
      if (notification.recipientId !== user.id) {
        throw new ForbiddenError('Forbidden');
      }
    }

    notification.read = true;
    await notification.save();

    res.json(successResponse(notification, 'Notification marked as read'));
  },
};
