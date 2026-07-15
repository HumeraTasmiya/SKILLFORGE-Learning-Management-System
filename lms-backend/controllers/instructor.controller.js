import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import LiveClass from '../models/LiveClass.js';
import { v4 as uuidv4 } from 'uuid';

// @route GET /api/instructor/dashboard
export const getInstructorDashboard = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((c) => c._id);

    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });

    const recentEnrollments = await Enrollment.find({
      course: { $in: courseIds },
    })
      .populate('user', 'name avatar email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await Enrollment.countDocuments({
          course: course._id,
        });
        const completions = await Enrollment.countDocuments({
          course: course._id,
          isCompleted: true,
        });
        return {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          category: course.category,
          isPublished: course.isPublished,
          enrollments,
          completions,
          rating: course.rating,
        };
      })
    );

    res.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalEnrollments,
        publishedCourses: courses.filter((c) => c.isPublished).length,
      },
      courseStats,
      recentEnrollments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/instructor/courses
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/instructor/courses/:id/students
export const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user.id,
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    const enrollments = await Enrollment.find({ course: course._id })
      .populate('user', 'name email avatar createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/instructor/live-class
export const scheduleLiveClass = async (req, res) => {
  try {
    const { title, description, courseId, scheduledAt, duration } = req.body;
    const roomId = uuidv4();

    const liveClass = await LiveClass.create({
      title,
      description,
      instructor: req.user.id,
      course: courseId,
      scheduledAt,
      duration,
      roomId,
    });

    res.status(201).json({ success: true, liveClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/instructor/live-classes
export const getLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find({ instructor: req.user.id })
      .populate('course', 'title')
      .sort({ scheduledAt: 1 });

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
