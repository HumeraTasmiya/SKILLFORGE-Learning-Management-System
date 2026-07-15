import express from 'express';
import {
  getInstructorDashboard,
  getInstructorCourses,
  getCourseStudents,
  scheduleLiveClass,
  getLiveClasses,
} from '../controllers/instructor.controller.js';
import {
  getInstructorWorkspace,
  answerCourseQuestion,
} from '../controllers/instructorWorkspace.controller.js';
import { instructorAi } from '../controllers/instructorAi.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { instructorAiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(protect, authorize('instructor', 'admin'));

router.get('/dashboard', getInstructorDashboard);
router.get('/workspace', getInstructorWorkspace);
router.patch('/questions/:id', answerCourseQuestion);
router.post('/ai', instructorAiLimiter, instructorAi);
router.get('/courses', getInstructorCourses);
router.get('/courses/:id/students', getCourseStudents);
router.post('/live-class', scheduleLiveClass);
router.get('/live-classes', getLiveClasses);

export default router;
