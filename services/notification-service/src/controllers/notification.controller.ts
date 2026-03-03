import { AuthRequest, successResponse } from '@vortex/common';
import { Response } from 'express';

import { Notification } from '../models/Notification';

export const notificationController = {
  async getNotifications(req: AuthRequest, res: Response) {
    const user = req.user!;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

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

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    res.json(
      successResponse(
        {
          data: notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        'Notifications retrieved',
      ),
    );
  },

  async markAsRead(req: AuthRequest, res: Response) {
    const id = req.params.id;
    const user = req.user!;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (user.role !== 'system') {
      if (notification.recipientId !== user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    notification.read = true;
    await notification.save();

    res.json(successResponse(notification, 'Notification marked as read'));
  },
};
