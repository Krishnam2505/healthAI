import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // The full name of the user
  name: {
    type: String,
    required: true,
    trim: true
  },
  // The user's email address, used for login and notifications
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // The hashed password for authentication
  password: {
    type: String,
    required: true
  },
  // The user's primary health goal
  goal: {
    type: String,
    enum: ['lose', 'maintain', 'gain'],
    default: 'maintain'
  },
  // The user's gender (for cycle tracking and biological metrics)
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  // The target weight in kg the user wants to reach
  targetWeight: {
    type: Number
  },
  // The user's target calories per day
  dailyCalorieTarget: {
    type: Number,
    default: 2000
  },
  // Timestamp for when the user account was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
