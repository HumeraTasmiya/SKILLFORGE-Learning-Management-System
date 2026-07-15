import Notification from '../models/Notification.js';

export const listNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt').limit(50);
  res.json({ success: true, notifications });
};

export const createNotification = async (req, res) => {
  const notification = await Notification.create(req.body);
  req.app.get('io')?.to(String(notification.user)).emit('notification:new', notification);
  res.status(201).json({ success: true, notification });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { readAt: new Date() },
    { new: true }
  );
  res.json({ success: true, notification });
};
