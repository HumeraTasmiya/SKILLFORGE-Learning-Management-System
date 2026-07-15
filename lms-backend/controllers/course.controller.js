import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import CourseQuestion from '../models/CourseQuestion.js';

// @route GET /api/courses
export const getAllCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .select('-lessons -quizzes')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/courses/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('reviews.user', 'name avatar');

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    // Check enrollment if user is logged in
    let isEnrolled = false;
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: course._id,
      });
      isEnrolled = !!enrollment;
    }

    // Hide lesson content for non-enrolled users (except preview lessons)
    const courseData = course.toObject();
    if (!isEnrolled) {
      courseData.lessons = courseData.lessons.map((lesson) => ({
        _id: lesson._id,
        title: lesson.title,
        duration: lesson.duration,
        isPreview: lesson.isPreview,
        ...(lesson.isPreview && {
          videoUrl: lesson.videoUrl,
          content: lesson.content,
          codeExample: lesson.codeExample,
        }),
      }));
      courseData.quizzes = [];
    }

    res.json({
      success: true,
      course: courseData,
      isEnrolled,
      progress: enrollment?.progress || 0,
      completedLessonIds:
        isEnrolled && enrollment?.completedLessons?.length
          ? enrollment.completedLessons.map((id) => String(id))
          : [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/courses (instructor/admin only)
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user.id,
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/courses/:id
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    // Only instructor or admin can update
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, course: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/courses/:id/lessons (add lesson)
export const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    course.lessons.push(req.body);
    await course.save();

    res.status(201).json({
      success: true,
      lesson: course.lessons[course.lessons.length - 1],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/courses/:id/review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id,
    });
    if (!enrollment) {
      return res
        .status(403)
        .json({ success: false, message: 'Enroll in course to review' });
    }

    // Check for existing review
    const existing = course.reviews.find(
      (r) => r.user.toString() === req.user.id
    );
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
    } else {
      course.reviews.push({ user: req.user.id, rating, comment });
    }

    // Recalculate average rating
    course.ratingsCount = course.reviews.length;
    course.rating =
      course.reviews.reduce((acc, r) => acc + r.rating, 0) /
      course.ratingsCount;

    await course.save();
    res.json({ success: true, message: 'Review submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/courses/:id/questions  (enrolled students)
export const askCourseQuestion = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const en = await Enrollment.findOne({ user: req.user.id, course: course._id });
    if (!en) {
      return res.status(403).json({ success: false, message: 'Enroll in the course to ask a question' });
    }
    const body = String(req.body?.body || '').trim();
    if (body.length < 3) {
      return res.status(400).json({ success: false, message: 'Question is too short' });
    }
    const q = await CourseQuestion.create({
      course: course._id,
      student: req.user.id,
      body,
    });
    res.status(201).json({ success: true, question: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
