import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    dueDate: Date,
    rubric: [{ label: String, points: Number }],
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        files: [{ title: String, url: String }],
        grade: Number,
        feedback: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
