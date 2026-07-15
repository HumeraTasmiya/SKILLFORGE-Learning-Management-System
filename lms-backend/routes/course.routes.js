import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  addReview,
  askCourseQuestion,
} from '../controllers/course.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/:id', optionalAuth, getCourseById);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), addLesson);
router.post('/:id/review', protect, addReview);
router.post('/:id/questions', protect, askCourseQuestion);

export default router;
