import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['system', 'course', 'payment', 'certificate', 'security'], default: 'system' },
    readAt: Date,
    actionUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
