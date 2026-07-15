import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { lastSevenDayFlags } from '../utils/studentActivity.js';

function sortedLessons(lessons) {
  return [...(lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function nextLessonMeta(course, completedLessonIds) {
  const done = new Set((completedLessonIds || []).map((id) => String(id)));
  const list = sortedLessons(course?.lessons);
  const next = list.find((l) => !done.has(String(l._id)));
  const nextIndex = next ? list.findIndex((l) => String(l._id) === String(next._id)) : list.length;
  return {
    next,
    lessonIndex: nextIndex >= 0 ? nextIndex : 0,
    lessonTotal: list.length || 0,
  };
}

// @route GET /api/users/student-dashboard
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, enrollments, certificatesEarned, notifications] = await Promise.all([
      User.findById(userId).select(
        'studyDates studyMinutesWeek studyWeekKey codingStreak name email avatar role',
      ),
      Enrollment.find({ user: userId })
        .populate({
          path: 'course',
          select: 'title thumbnail category level lessons instructor',
          populate: { path: 'instructor', select: 'name' },
        })
        .sort({ lastAccessedAt: -1 }),
      Certificate.countDocuments({ user: userId, status: 'approved' }),
      Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(12).lean(),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const enrolledCourses = enrollments.length;
    const hoursStudiedThisWeek = Math.round(((user.studyMinutesWeek || 0) / 60) * 10) / 10;

    const allScores = [];
    enrollments.forEach((en) => {
      const title = en.course?.title || 'Course';
      (en.quizScores || []).forEach((q) => {
        allScores.push({
          courseTitle: title,
          score: q.score,
          total: q.total,
          attemptedAt: q.attemptedAt || en.updatedAt,
        });
      });
    });
    allScores.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
    const recentQuizScores = allScores.slice(0, 8);

    let avgQuizScore = null;
    if (allScores.length > 0) {
      const sum = allScores.reduce((acc, q) => acc + (Number(q.score) || 0), 0);
      avgQuizScore = Math.round(sum / allScores.length);
    }

    const continueLearning = [];
    for (const en of enrollments) {
      const c = en.course;
      if (!c || typeof c === 'string' || en.isCompleted) continue;

      const lessonList = sortedLessons(c.lessons);
      const totalLessons = lessonList.length || 1;
      const completedCount = Array.isArray(en.completedLessons) ? en.completedLessons.length : 0;
      const progress =
        typeof en.progress === 'number'
          ? Math.round(en.progress)
          : Math.min(100, Math.round((completedCount / totalLessons) * 100));

      const { next, lessonIndex, lessonTotal } = nextLessonMeta(c, en.completedLessons);
      const chapterLabel =
        lessonTotal > 0 ? `Lesson ${Math.min(lessonIndex + 1, lessonTotal)} of ${lessonTotal}` : 'Course';

      continueLearning.push({
        enrollmentId: en._id,
        courseId: c._id,
        title: c.title,
        thumbnail: c.thumbnail || '',
        category: c.category || '',
        progress,
        chapterLabel,
        lessonTitle: next?.title || (lessonTotal ? 'All lessons complete — review' : 'Start first lesson'),
        resumeLessonId: next?._id || lessonList[0]?._id || null,
        instructorName: c.instructor?.name || '',
        lastAccessedAt: en.lastAccessedAt,
      });
    }

    const paceItems = enrollments
      .filter((en) => en.course && typeof en.course !== 'string' && !en.isCompleted)
      .map((en) => {
        const c = en.course;
        const { next } = nextLessonMeta(c, en.completedLessons);
        const due = new Date(en.lastAccessedAt || Date.now());
        due.setDate(due.getDate() + 5);
        return {
          id: String(en._id),
          title: next ? `Continue: ${next.title}` : `Keep pace: ${c.title}`,
          subtitle: c.title,
          courseId: c._id,
          dueAt: due.toISOString(),
          lessonTitle: next?.title || '',
        };
      })
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
      .slice(0, 3);

    const announcements = notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt,
      readAt: n.readAt,
    }));

    res.json({
      success: true,
      metrics: {
        enrolledCourses,
        hoursStudiedThisWeek,
        avgQuizScore,
        certificatesEarned,
      },
      continueLearning: continueLearning.slice(0, 12),
      streakDays: user.codingStreak || 0,
      studyDaysLast7: lastSevenDayFlags(user.studyDates),
      upcomingDeadlines: paceItems,
      recentQuizScores,
      announcements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
