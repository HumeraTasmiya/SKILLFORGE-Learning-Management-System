import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    attachments: [{ name: String, url: String, mimeType: String }],
    locale: { type: String, default: 'en' },
  },
  { timestamps: true }
);

export default mongoose.model('ChatMessage', chatMessageSchema);
