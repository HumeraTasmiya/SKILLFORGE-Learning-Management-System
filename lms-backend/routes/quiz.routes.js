import express from 'express';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route POST /api/quizzes/:courseId
router.post('/:courseId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.quizzes.push(req.body);
    await course.save();

    res.status(201).json({ success: true, quiz: course.quizzes[course.quizzes.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/quizzes/:courseId/:quizId
router.put('/:courseId/:quizId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const quiz = course?.quizzes.id(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    Object.assign(quiz, req.body);
    await course.save();

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/quizzes/:courseId/:quizId
router.delete('/:courseId/:quizId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.quizzes = course.quizzes.filter(
      (q) => q._id.toString() !== req.params.quizId
    );
    await course.save();

    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
