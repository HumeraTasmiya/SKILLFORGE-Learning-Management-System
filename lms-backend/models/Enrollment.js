import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    progress: {
      type: Number,
      default: 0, // percentage 0-100
    },
    quizScores: [
      {
        quizId: mongoose.Schema.Types.ObjectId,
        score: Number,
        total: Number,
        attemptedAt: { type: Date, default: Date.now },
        /** True when any answer was wrong — surfaces in instructor grading queue */
        needsManualReview: { type: Boolean, default: false },
        reviewedAt: Date,
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
