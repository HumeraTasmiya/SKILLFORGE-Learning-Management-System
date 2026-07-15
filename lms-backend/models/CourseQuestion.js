import mongoose from 'mongoose';

const courseQuestionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true },
    answer: { type: String, default: '' },
    answeredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('CourseQuestion', courseQuestionSchema);
