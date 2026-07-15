import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  codeExample: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // in minutes
  order: { type: Number, default: 0 },
  isPreview: { type: Boolean, default: false },
  resources: [
    {
      title: String,
      url: String,
    },
  ],
});

const quizSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  answer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    category: {
      type: String,
      enum: [
        'HTML',
        'CSS',
        'JavaScript',
        'React',
        'Node.js',
        'MongoDB',
        'Python',
        'Java',
        'C',
        'C++',
        'TypeScript',
        'Next.js',
        'DevOps',
        'Git',
        'DSA',
        'Other',
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessons: [lessonSchema],
    quizzes: [quizSchema],
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    totalDuration: { type: Number, default: 0 }, // total in minutes
    language: { type: String, default: 'English' },
    tags: [{ type: String }],
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
