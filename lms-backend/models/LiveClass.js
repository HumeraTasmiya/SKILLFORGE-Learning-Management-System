import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    roomId: { type: String, unique: true },
    isActive: { type: Boolean, default: false },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    recordingUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('LiveClass', liveClassSchema);
