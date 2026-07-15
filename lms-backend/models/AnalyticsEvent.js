import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    event: { type: String, required: true, index: true },
    properties: Object,
    sessionId: String,
    ipHash: String,
  },
  { timestamps: true }
);

export default mongoose.model('AnalyticsEvent', analyticsEventSchema);
