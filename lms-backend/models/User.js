import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'instructor'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    certificates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate',
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    notes: [
      {
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
        content: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    codingStreak: {
      type: Number,
      default: 0,
    },
    /** YYYY-MM-DD keys (UTC) with any learning activity — used for the 7-day dashboard ring */
    studyDates: {
      type: [String],
      default: [],
    },
    /** Monday UTC key; when it changes, studyMinutesWeek resets */
    studyWeekKey: {
      type: String,
      default: '',
    },
    studyMinutesWeek: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
