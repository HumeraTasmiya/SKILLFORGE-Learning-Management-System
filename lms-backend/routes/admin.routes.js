import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleCoursePublish,
  approveCertificate,
  getRoles,
  updateRole,
  getCertificates,
  getAdminAnalytics,
  publishAnnouncement,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/roles', getRoles);
router.put('/roles/:name', updateRole);
router.get('/certificates', getCertificates);
router.put('/courses/:id/publish', toggleCoursePublish);
router.put('/certificates/:id/approve', approveCertificate);
router.post('/announcements', publishAnnouncement);

export default router;
