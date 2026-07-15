import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['student', 'instructor', 'admin'], unique: true, required: true },
    permissions: [{ type: String }],
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
