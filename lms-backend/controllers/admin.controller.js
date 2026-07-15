import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';
import Role from '../models/Role.js';
import Payment from '../models/Payment.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Notification from '../models/Notification.js';
import LiveClass from '../models/LiveClass.js';
import bcrypt from 'bcryptjs';

const DEFAULT_ROLES = [
  {
    name: 'student',
    description: 'Learners enrolled in courses',
    permissions: ['enroll', 'cert', 'forum'],
  },
  {
    name: 'instructor',
    description: 'Course builders and learner coaches',
    permissions: ['grade', 'live'],
  },
  {
    name: 'admin',
    description: 'Platform operators with full governance access',
    permissions: ['users', 'billing', 'sec'],
  },
];

const ensureRoles = async () => {
  await Promise.all(
    DEFAULT_ROLES.map((role) =>
      Role.findOneAndUpdate({ name: role.name }, { $setOnInsert: role }, { new: true, upsert: true }),
    ),
  );
  return Role.find().sort({ name: 1 });
};

const dayLabel = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const monthLabel = (date) => date.toLocaleDateString('en-US', { month: 'short' });

const buildEmptySeries = (range) => {
  const now = new Date();
  const points = range === '90d' ? 3 : range === '30d' ? 4 : 7;

  return Array.from({ length: points }, (_, index) => {
    const date = new Date(now);
    if (range === '90d') {
      date.setMonth(now.getMonth() - (points - 1 - index));
      return { key: `${date.getFullYear()}-${date.getMonth() + 1}`, label: monthLabel(date), users: 0, sessions: 0, revenue: 0 };
    }
    date.setDate(now.getDate() - (points - 1 - index) * (range === '30d' ? 7 : 1));
    return { key: date.toISOString().slice(0, 10), label: range === '30d' ? `W${index + 1}` : dayLabel(date), users: 0, sessions: 0, revenue: 0 };
  });
};

const bucketForDate = (date, range) => {
  const d = new Date(date);
  if (range === '90d') return `${d.getFullYear()}-${d.getMonth() + 1}`;
  if (range === '30d') {
    const now = new Date();
    const daysAgo = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    const bucket = 3 - Math.floor(daysAgo / 7);
    return bucket >= 0 && bucket <= 3 ? buildEmptySeries('30d')[bucket].key : null;
  }
  return d.toISOString().slice(0, 10);
};

const formatActivityTime = (date) => (date ? new Date(date) : new Date());

const buildRecentActivities = ({ recentUsers, recentEnrollments, recentPayments, recentCertificates, recentAiEvents }) => {
  const activities = [];

  recentUsers.forEach((user) => {
    activities.push({
      id: `user-${user._id}`,
      type: 'user',
      title: 'New user joined',
      detail: `${user.name || user.email} registered as ${user.role}`,
      at: formatActivityTime(user.createdAt),
    });
  });

  recentEnrollments.forEach((enrollment) => {
    activities.push({
      id: `enrollment-${enrollment._id}`,
      type: 'enrollment',
      title: 'New enrollment',
      detail: `${enrollment.user?.name || 'Learner'} joined ${enrollment.course?.title || 'a course'}`,
      at: formatActivityTime(enrollment.createdAt),
    });
  });

  recentPayments.forEach((payment) => {
    activities.push({
      id: `payment-${payment._id}`,
      type: 'payment',
      title: 'Certificate purchase',
      detail: `${payment.user?.name || 'Learner'} paid ${payment.currency || 'USD'} ${payment.amount || 0} for ${payment.course?.title || 'a certificate'}`,
      at: formatActivityTime(payment.createdAt),
    });
  });

  recentCertificates.forEach((certificate) => {
    activities.push({
      id: `certificate-${certificate._id}`,
      type: 'certificate',
      title: `${certificate.status === 'approved' ? 'Certificate approved' : 'Certificate requested'}`,
      detail: `${certificate.user?.name || 'Learner'} - ${certificate.course?.title || 'Course'}`,
      at: formatActivityTime(certificate.createdAt),
    });
  });

  recentAiEvents.forEach((event) => {
    activities.push({
      id: `ai-${event._id}`,
      type: 'ai',
      title: 'AI usage recorded',
      detail: event.event,
      at: formatActivityTime(event.createdAt),
    });
  });

  return activities.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12);
};

// @route GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const [
      totalUsers,
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      pendingCertificates,
      paidRevenue,
      activeLearners,
      completionStats,
      newEnrollments,
      aiUsageTotal,
      aiUsageWeek,
      liveClassesToday,
      certificatePurchases,
      pendingInstructorApprovals,
      recentUsers,
      recentCourses,
      recentEnrollments,
      recentPayments,
      recentCertificates,
      recentAiEvents,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Certificate.countDocuments({ status: 'approved' }),
      Certificate.countDocuments({ status: 'pending' }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Enrollment.distinct('user', { lastAccessedAt: { $gte: thirtyDaysAgo } }),
      Enrollment.aggregate([
        {
          $group: {
            _id: null,
            avgProgress: { $avg: '$progress' },
            completed: { $sum: { $cond: ['$isCompleted', 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
      Enrollment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      AnalyticsEvent.countDocuments({ event: { $regex: /ai|chat|assistant|mentor/i } }),
      AnalyticsEvent.countDocuments({
        event: { $regex: /ai|chat|assistant|mentor/i },
        createdAt: { $gte: sevenDaysAgo },
      }),
      LiveClass.countDocuments({ scheduledAt: { $gte: todayStart, $lt: tomorrowStart } }),
      Payment.countDocuments({ status: 'paid', certificate: { $exists: true, $ne: null } }),
      User.countDocuments({
        role: 'instructor',
        $or: [{ isVerified: false }, { isActive: false }],
      }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Course.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('instructor', 'name')
        .select('title category isPublished enrolledStudents'),
      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name email')
        .populate('course', 'title')
        .select('user course createdAt'),
      Payment.find({ status: 'paid' })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name email')
        .populate('course', 'title')
        .select('user course amount currency createdAt'),
      Certificate.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('user', 'name email')
        .populate('course', 'title')
        .select('user course status createdAt'),
      AnalyticsEvent.find({ event: { $regex: /ai|chat|assistant|mentor/i } })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('event createdAt'),
    ]);

    // Monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Students by role count
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    // Top courses by enrollment
    const rawTopCourses = await Course.find({ isPublished: true })
      .sort({ 'enrolledStudents.length': -1 })
      .limit(5)
      .populate('instructor', 'name')
      .select('title category enrolledStudents rating');

    const topCourseIds = rawTopCourses.map((course) => course._id);
    const topCourseCompletion = await Enrollment.aggregate([
      { $match: { course: { $in: topCourseIds } } },
      {
        $group: {
          _id: '$course',
          avgProgress: { $avg: '$progress' },
          completions: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          enrollments: { $sum: 1 },
        },
      },
    ]);
    const completionByCourse = new Map(topCourseCompletion.map((row) => [String(row._id), row]));
    const topCourses = rawTopCourses.map((course) => {
      const row = completionByCourse.get(String(course._id));
      return {
        _id: course._id,
        title: course.title,
        category: course.category,
        instructor: course.instructor,
        rating: course.rating,
        enrolledStudents: course.enrolledStudents,
        enrollmentCount: row?.enrollments || course.enrolledStudents?.length || 0,
        completionRate: row?.enrollments ? Math.round((row.completions / row.enrollments) * 100) : 0,
        avgProgress: Math.round(row?.avgProgress || 0),
      };
    });

    const completionRow = completionStats[0] || {};
    const courseCompletionRate = completionRow.total
      ? Math.round((completionRow.completed / completionRow.total) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalCertificates,
        pendingCertificates,
        revenue: paidRevenue[0]?.total || 0,
        certificateRevenue: paidRevenue[0]?.total || 0,
        activeLearners: activeLearners.length,
        courseCompletionRate,
        averageProgress: Math.round(completionRow.avgProgress || 0),
        newEnrollments,
        aiUsageTotal,
        aiUsageWeek,
        liveClassesToday,
        certificatePurchases,
        pendingInstructorApprovals,
        activeStudents: await User.countDocuments({
          role: 'student',
          isActive: true,
        }),
      },
      recentUsers,
      recentCourses,
      recentActivities: buildRecentActivities({
        recentUsers,
        recentEnrollments,
        recentPayments,
        recentCertificates,
        recentAiEvents,
      }),
      monthlyGrowth,
      roleStats,
      topCourses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/users
export const createUser = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();
    const role = ['student', 'instructor', 'admin'].includes(req.body.role) ? req.body.role : 'student';

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Name, email, and a 6+ character password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'A user with that email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role,
      isVerified: true,
      isActive: true,
    });

    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const updates = {};
    ['name', 'email', 'role'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.isVerified !== undefined) updates.isVerified = req.body.isVerified;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/courses/:id/publish
export const toggleCoursePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'}`,
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/certificates/:id/approve
export const approveCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('user', 'name email').populate('course', 'title');
    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/roles
export const getRoles = async (req, res) => {
  try {
    const roles = await ensureRoles();
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/roles/:name
export const updateRole = async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { name: req.params.name },
      { permissions: Array.isArray(req.body.permissions) ? req.body.permissions : [] },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/certificates
export const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(25);
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const range = ['7d', '30d', '90d'].includes(req.query.range) ? req.query.range : '7d';
    const series = buildEmptySeries(range);
    const start = new Date();
    start.setDate(start.getDate() - (range === '90d' ? 90 : range === '30d' ? 30 : 7));

    const [newUsers, sessions, revenue] = await Promise.all([
      User.find({ createdAt: { $gte: start } }).select('createdAt'),
      AnalyticsEvent.find({ createdAt: { $gte: start } }).select('createdAt event'),
      Payment.find({ status: 'paid', createdAt: { $gte: start } }).select('createdAt amount'),
    ]);

    const byKey = Object.fromEntries(series.map((point) => [point.key, point]));
    newUsers.forEach((user) => {
      const key = bucketForDate(user.createdAt, range);
      if (byKey[key]) byKey[key].users += 1;
    });
    sessions.forEach((event) => {
      const key = bucketForDate(event.createdAt, range);
      if (byKey[key]) byKey[key].sessions += 1;
    });
    revenue.forEach((payment) => {
      const key = bucketForDate(payment.createdAt, range);
      if (byKey[key]) byKey[key].revenue += payment.amount || 0;
    });

    res.json({ success: true, range, series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/admin/announcements
export const publishAnnouncement = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const message = String(req.body.message || '').trim();
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const users = await User.find({ isActive: true }).select('_id');
    const docs = users.map((user) => ({
      user: user._id,
      title,
      message,
      type: 'system',
      actionUrl: req.body.actionUrl || '/dashboard',
    }));
    const notifications = docs.length ? await Notification.insertMany(docs) : [];

    const io = req.app.get('io');
    notifications.forEach((notification) => {
      io?.to(`user-${notification.user}`).emit('notification', notification);
    });

    res.status(201).json({ success: true, sent: notifications.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
