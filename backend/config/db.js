import mongoose from 'mongoose';

export const isDatabaseReady = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task-manager';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('MongoDB unavailable. Starting app in development fallback mode.');
    console.warn(error.message);
    return false;
  }
};

export default connectDB;
