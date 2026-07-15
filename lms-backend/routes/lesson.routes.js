import express from 'express';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// @route GET /api/lessons/:courseId/:lessonId
router.get('/:courseId/:lessonId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check if preview or enrolled
    if (!lesson.isPreview) {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: course._id,
      });
      if (!enrollment && req.user.role === 'student') {
        return res.status(403).json({ success: false, message: 'Please enroll to access this lesson' });
      }
    }

    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/lessons/:courseId/:lessonId
router.put('/:courseId/:lessonId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    Object.assign(lesson, req.body);
    await course.save();

    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/lessons/:courseId/:lessonId
router.delete('/:courseId/:lessonId', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.lessons = course.lessons.filter(
      (l) => l._id.toString() !== req.params.lessonId
    );
    await course.save();

    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
