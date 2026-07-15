import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import { generateCertificateId } from '../utils/certificate.js';
import { recordStudentStudy } from '../utils/studentActivity.js';

// @route POST /api/enrollments/:courseId
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    const existing = await Enrollment.findOne({
      user: req.user.id,
      course: course._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Already enrolled' });
    }

    const enrollment = await Enrollment.create({
      user: req.user.id,
      course: course._id,
    });

    // Add to user's enrolledCourses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id },
    });

    // Add to course's enrolledStudents
    await Course.findByIdAndUpdate(course._id, {
      $push: { enrolledStudents: req.user.id },
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/enrollments/:courseId/progress
export const updateProgress = async (req, res) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res
        .status(400)
        .json({ success: false, message: 'lessonId is required' });
    }

    let lessonObjectId;
    try {
      lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    } catch {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid lessonId' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    const lessonBelongs = course.lessons.some((l) =>
      l._id.equals(lessonObjectId),
    );
    if (!lessonBelongs) {
      return res.status(400).json({
        success: false,
        message: 'Lesson does not belong to this course.',
      });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });
    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: 'Enrollment not found' });
    }

    const alreadyDone = enrollment.completedLessons.some((id) =>
      id.equals(lessonObjectId),
    );
    const lessonMeta = course.lessons.find((l) => l._id.equals(lessonObjectId));
    const lessonMins = lessonMeta?.duration > 0 ? lessonMeta.duration : 15;
    if (!alreadyDone) {
      enrollment.completedLessons.push(lessonObjectId);
      await recordStudentStudy(req.user.id, lessonMins);
    }

    const totalLessons = course.lessons.length;
    enrollment.progress =
      totalLessons > 0
        ? Math.round(
            (enrollment.completedLessons.length / totalLessons) * 100,
          )
        : 0;
    enrollment.lastAccessedAt = Date.now();

    // Mark completed if 100%
    if (enrollment.progress === 100 && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = Date.now();
    }

    await enrollment.save();

    // Auto-generate certificate if score >= 75 and course completed
    if (enrollment.isCompleted && !enrollment.certificateIssued) {
      const avgScore = enrollment.quizScores.length
        ? enrollment.quizScores.reduce((a, b) => a + b.score, 0) /
          enrollment.quizScores.length
        : 100;

      if (avgScore >= 75) {
        const certId = generateCertificateId();
        const certificate = await Certificate.create({
          user: req.user.id,
          course: req.params.courseId,
          certificateId: certId,
          score: avgScore,
          status: 'approved',
        });

        enrollment.certificateIssued = true;
        await enrollment.save();

        await User.findByIdAndUpdate(req.user.id, {
          $push: { certificates: certificate._id },
        });
      }
    }

    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/enrollments/my
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate({
        path: 'course',
        select: 'title thumbnail category level rating lessons',
        populate: { path: 'instructor', select: 'name avatar' },
      })
      .sort({ lastAccessedAt: -1 });

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/enrollments/:courseId/quiz
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionIndex, answer }]

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    let score = 0;
    const results = course.quizzes.map((q, i) => {
      const userAnswer = answers[i]?.answer;
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) score++;
      return { question: q.question, correct: isCorrect, explanation: q.explanation };
    });

    const n = course.quizzes.length;
    const percentage = n > 0 ? Math.round((score / n) * 100) : 0;
    const needsManualReview = results.some((r) => !r.correct);

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId,
    });

    if (enrollment && n > 0) {
      enrollment.quizScores.push({
        score: percentage,
        total: n,
        needsManualReview,
      });
      await enrollment.save();
      await recordStudentStudy(req.user.id, 10);
    }

    res.json({
      success: true,
      score,
      total: n,
      percentage,
      passed: percentage >= 75,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
