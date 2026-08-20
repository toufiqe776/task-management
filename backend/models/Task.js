import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model('Task', taskSchema);