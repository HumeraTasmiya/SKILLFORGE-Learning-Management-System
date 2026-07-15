import express from 'express';
import { createNotification, listNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, listNotifications);
router.post('/', protect, authorize('admin', 'instructor'), createNotification);
router.patch('/:id/read', protect, markNotificationRead);

export default router;
