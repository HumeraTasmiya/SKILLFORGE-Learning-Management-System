// enrollment.routes.js
import express from 'express';
import {
  enrollCourse,
  updateProgress,
  getMyEnrollments,
  submitQuiz,
} from '../controllers/enrollment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:courseId', protect, enrollCourse);
router.put('/:courseId/progress', protect, updateProgress);
router.get('/my', protect, getMyEnrollments);
router.post('/:courseId/quiz', protect, submitQuiz);

export default router;
