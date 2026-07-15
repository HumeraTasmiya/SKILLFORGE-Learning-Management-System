import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import LiveClass from '../models/LiveClass.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import CourseQuestion from '../models/CourseQuestion.js';
import User from '../models/User.js';

function lessonSlotCompleteness(lesson) {
  let ok = 0;
  const total = 3;
  if (lesson.title?.trim()) ok += 1;
  if (lesson.videoUrl?.trim()) ok += 1;
  if (lesson.content?.trim() || lesson.codeExample?.trim()) ok += 1;
  return ok / total;
}

function courseContentBuiltPct(course) {
  const lessons = course.lessons || [];
  if (!lessons.length) return 0;
  const sum = lessons.reduce((acc, l) => acc + lessonSlotCompleteness(l), 0);
  return Math.round((sum / lessons.length) * 100);
}

function buildLessonEngagement(courses, enrollments) {
  const rows = [];
  for (const c of courses) {
    const enrForC = enrollments.filter((e) => e.course.toString() === c._id.toString());
    const n = Math.max(enrForC.length, 1);
    for (const lesson of c.lessons || []) {
      const lid = lesson._id;
      const completed = enrForC.filter((e) =>
        (e.completedLessons || []).some((id) => String(id) === String(lid)),
      ).length;
      const completionPct = Math.round((completed / n) * 100);
      const shortTitle = c.title.length > 22 ? `${c.title.slice(0, 22)}…` : c.title;
      rows.push({
        courseId: c._id,
        courseTitle: c.title,
        lessonId: lid,
        lessonTitle: lesson.title,
        label: `${shortTitle} · ${lesson.title}`,
        completionPct,
        enrolled: enrForC.length,
      });
    }
  }
  return rows.sort((a, b) => a.completionPct - b.completionPct).slice(0, 14);
}

function riskLevel(score) {
  if (score >= 55) return 'critical';
  if (score >= 30) return 'warning';
  return 'ok';
}

function enrollmentRiskScore(en, createdMs) {
  let s = 0;
  const last = en.lastAccessedAt ? new Date(en.lastAccessedAt).getTime() : createdMs;
  const daysIdle = (Date.now() - last) / 86400000;
  if (daysIdle >= 14) s += 45;
  else if (daysIdle >= 7) s += 28;
  else if (daysIdle >= 3) s += 12;

  const attempts = en.quizScores || [];
  if (attempts.length) {
    const avg = attempts.reduce((a, q) => a + (Number(q.score) || 0), 0) / attempts.length;
    if (avg < 55) s += 35;
    else if (avg < 70) s += 18;
  }

  const prog = Number(en.progress) || 0;
  const ageDays = (Date.now() - createdMs) / 86400000;
  if (prog < 25 && ageDays > 10) s += 22;
  else if (prog < 40 && ageDays > 14) s += 12;

  return Math.min(100, Math.round(s));
}

// @route GET /api/instructor/workspace
export const getInstructorWorkspace = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort({ updatedAt: -1 });
    const courseIds = courses.map((c) => c._id);
    const courseById = new Map(courses.map((c) => [c._id.toString(), c]));

    const distinctStudents = await Enrollment.distinct('user', { course: { $in: courseIds } });
    const totalStudents = distinctStudents.length;
    const activeCourses = courses.filter((c) => c.isPublished).length;

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email avatar lastActiveDate')
      .populate('course', 'title')
      .lean();

    const avgCompletion = enrollments.length
      ? Math.round(
          enrollments.reduce((acc, e) => acc + (Number(e.progress) || 0), 0) / enrollments.length,
        )
      : 0;

    let ratingSum = 0;
    let ratingWeight = 0;
    courses.forEach((c) => {
      const w = Number(c.ratingsCount) || 0;
      const r = Number(c.rating) || 0;
      if (w > 0 && r > 0) {
        ratingSum += r * w;
        ratingWeight += w;
      }
    });
    const overallRating = ratingWeight ? Math.round((ratingSum / ratingWeight) * 10) / 10 : 0;

    const myCourses = courses.map((c) => {
      const enrN = enrollments.filter((e) => e.course.toString() === c._id.toString()).length;
      return {
        _id: c._id,
        title: c.title,
        description: c.description,
        thumbnail: c.thumbnail,
        category: c.category,
        level: c.level,
        language: c.language,
        price: c.price,
        isFree: c.isFree,
        isPublished: c.isPublished,
        tags: c.tags || [],
        totalDuration: c.totalDuration,
        studentCount: enrN,
        contentBuiltPct: courseContentBuiltPct(c),
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
      };
    });

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .lean();

    const gradingQueue = [];
    const assignStudentIds = new Set();

    for (const a of assignments) {
      for (const sub of a.submissions || []) {
        if (typeof sub.grade !== 'number') assignStudentIds.add(String(sub.student));
      }
    }
    const assignUsers =
      assignStudentIds.size > 0
        ? await User.find({ _id: { $in: [...assignStudentIds] } }).select('name email').lean()
        : [];
    const assignUserMap = Object.fromEntries(assignUsers.map((u) => [String(u._id), u]));

    for (const a of assignments) {
      const ctitle = a.course?.title || 'Course';
      for (const sub of a.submissions || []) {
        if (typeof sub.grade !== 'number') {
          const st = assignUserMap[String(sub.student)];
          gradingQueue.push({
            id: `asg:${a._id}:${sub.student}`,
            type: 'assignment',
            title: a.title,
            courseTitle: ctitle,
            courseId: a.course?._id,
            studentName: st?.name || st?.email || 'Student',
            submittedAt: sub.submittedAt || a.updatedAt,
            meta: `${a.rubric?.length || 0} rubric rows`,
          });
        }
      }
    }

    for (const en of enrollments) {
      const ctitle = en.course?.title || 'Course';
      const studentName = en.user?.name || en.user?.email || 'Student';
      (en.quizScores || []).forEach((q, idx) => {
        if (q.needsManualReview && !q.reviewedAt) {
          gradingQueue.push({
            id: `quiz:${en._id}:${idx}`,
            type: 'quiz_review',
            title: 'Quiz attempt — manual review',
            courseTitle: ctitle,
            courseId: en.course?._id,
            enrollmentId: en._id,
            scoreIndex: idx,
            studentName,
            submittedAt: q.attemptedAt || en.updatedAt,
            meta: `Score ${q.score}%`,
          });
        }
      });
    }

    gradingQueue.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const lessonEngagement = buildLessonEngagement(courses, enrollments);

    const atRisk = [];
    const seenUserCourse = new Set();
    for (const en of enrollments) {
      const key = `${en.user?._id}:${en.course}`;
      if (seenUserCourse.has(key)) continue;
      seenUserCourse.add(key);
      const createdMs = new Date(en.createdAt).getTime();
      const score = enrollmentRiskScore(en, createdMs);
      const level = riskLevel(score);
      if (level === 'ok') continue;
      atRisk.push({
        enrollmentId: en._id,
        courseId: en.course,
        courseTitle: courseById.get(en.course.toString())?.title || 'Course',
        studentName: en.user?.name || en.user?.email || 'Student',
        studentEmail: en.user?.email,
        progress: en.progress || 0,
        lastAccessedAt: en.lastAccessedAt,
        idleDays: Math.floor(
          (Date.now() - (en.lastAccessedAt ? new Date(en.lastAccessedAt).getTime() : createdMs)) /
            86400000,
        ),
        riskScore: score,
        level,
      });
    }
    atRisk.sort((a, b) => b.riskScore - a.riskScore);
    const atRiskTop = atRisk.slice(0, 25);

    const activityFeed = [];

    const recentEn = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    recentEn.forEach((e) => {
      activityFeed.push({
        id: `enroll-${e._id}`,
        type: 'enrollment',
        title: 'New enrollment',
        detail: `${e.user?.name || 'Learner'} joined ${e.course?.title || 'a course'}`,
        at: e.createdAt,
      });
    });

    const subActivityIds = new Set();
    for (const a of assignments) {
      for (const sub of a.submissions || []) {
        if (sub.submittedAt) subActivityIds.add(String(sub.student));
      }
    }
    const subUsers =
      subActivityIds.size > 0
        ? await User.find({ _id: { $in: [...subActivityIds] } }).select('name').lean()
        : [];
    const subUserMap = Object.fromEntries(subUsers.map((u) => [String(u._id), u]));

    for (const a of assignments) {
      for (const sub of a.submissions || []) {
        if (!sub.submittedAt) continue;
        const st = subUserMap[String(sub.student)];
        activityFeed.push({
          id: `sub-${a._id}-${sub.student}-${sub.submittedAt}`,
          type: 'submission',
          title: 'Assignment submitted',
          detail: `${st?.name || 'Student'} · ${a.title}`,
          at: sub.submittedAt,
        });
      }
    }

    const chatEvents = await AnalyticsEvent.find({
      course: { $in: courseIds },
      event: { $regex: /chat|chatbot|assistant/i },
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();
    chatEvents.forEach((ev) => {
      activityFeed.push({
        id: `an-${ev._id}`,
        type: 'chatbot',
        title: 'AI / learning activity',
        detail: `${ev.event}${ev.properties?.topic ? ` · ${ev.properties.topic}` : ''}`,
        at: ev.createdAt,
      });
    });

    atRiskTop.slice(0, 5).forEach((r) => {
      if (r.level === 'critical') {
        activityFeed.push({
          id: `risk-${r.enrollmentId}`,
          type: 'at_risk',
          title: 'At-risk learner signal',
          detail: `${r.studentName} in ${r.courseTitle} (${r.idleDays}d idle)`,
          at: new Date(),
        });
      }
    });

    activityFeed.sort((a, b) => new Date(b.at) - new Date(a.at));
    const activityFeedSorted = activityFeed.slice(0, 25);

    const qaRaw = await CourseQuestion.find({ course: { $in: courseIds } })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    const qaQueue = qaRaw
      .filter((q) => !q.answeredAt)
      .map((q) => ({
        _id: q._id,
        courseId: q.course,
        courseTitle: q.course?.title || 'Course',
        studentName: q.student?.name || q.student?.email || 'Student',
        body: q.body,
        createdAt: q.createdAt,
        overdue: Date.now() - new Date(q.createdAt).getTime() > 24 * 60 * 60 * 1000,
      }));

    const now = Date.now();
    const liveUpcoming = await LiveClass.find({
      instructor: req.user.id,
      scheduledAt: { $gte: new Date(now - 60 * 60 * 1000) },
    })
      .populate('course', 'title')
      .sort({ scheduledAt: 1 })
      .limit(8)
      .lean();

    const schedule = [];

    liveUpcoming.forEach((lc) => {
      schedule.push({
        id: `live-${lc._id}`,
        kind: 'live_session',
        title: lc.title,
        subtitle: lc.course?.title || 'Course',
        at: lc.scheduledAt,
        meta: `${lc.duration || 60} min`,
      });
    });

    for (const a of assignments) {
      if (a.dueDate) {
        schedule.push({
          id: `due-${a._id}`,
          kind: 'deadline',
          title: `Due: ${a.title}`,
          subtitle: a.course?.title || 'Course',
          at: a.dueDate,
          meta: 'Assignment',
        });
      }
    }

    courses.forEach((c) => {
      const reviewAt = new Date(c.updatedAt);
      reviewAt.setDate(reviewAt.getDate() + 14);
      if (reviewAt.getTime() > now) {
        schedule.push({
          id: `rev-${c._id}`,
          kind: 'content_review',
          title: 'Suggested content review',
          subtitle: c.title,
          at: reviewAt,
          meta: '14d after last edit',
        });
      }
    });

    schedule.sort((a, b) => new Date(a.at) - new Date(b.at));
    const scheduleTop = schedule.slice(0, 12);

    res.json({
      success: true,
      metrics: {
        totalStudents,
        activeCourses,
        avgCompletion,
        overallRating,
        totalCourses: courses.length,
      },
      myCourses,
      gradingQueue: gradingQueue.slice(0, 40),
      lessonEngagement,
      atRisk: atRiskTop,
      activityFeed: activityFeedSorted,
      qaQueue,
      schedule: scheduleTop,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PATCH /api/instructor/questions/:id
export const answerCourseQuestion = async (req, res) => {
  try {
    const cq = await CourseQuestion.findById(req.params.id).populate('course', 'instructor title');
    if (!cq) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    const instId = cq.course?.instructor ? String(cq.course.instructor) : '';
    if (instId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const answer = String(req.body?.answer ?? '').trim();
    if (!answer) {
      return res.status(400).json({ success: false, message: 'Answer is required' });
    }
    cq.answer = answer;
    cq.answeredAt = new Date();
    await cq.save();
    res.json({ success: true, question: cq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
