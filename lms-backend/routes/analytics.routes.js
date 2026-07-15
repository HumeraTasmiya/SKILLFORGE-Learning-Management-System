import express from 'express';
import {
  getDashboardAnalytics,
  getLandingStats,
  getProgressTrend,
  getTestimonials,
  trackEvent,
} from '../controllers/analytics.controller.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/events', optionalAuth, trackEvent);
router.get('/dashboard', protect, authorize('admin', 'instructor'), getDashboardAnalytics);
router.get('/landing', getLandingStats);
router.get('/testimonials', getTestimonials);
router.get('/progress-trend', optionalAuth, getProgressTrend);

export default router;
