import mongoose from 'mongoose';

const sleepSchema = new mongoose.Schema({
  // Link to the user who logged this sleep entry
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // How many hours the user slept
  hours: {
    type: Number,
    required: true
  },
  // Self-reported sleep quality (1 = Poor, 5 = Excellent)
  quality: {
    type: Number,
    min: 1,
    max: 5
  },
  // When the sleep occurred
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Sleep', sleepSchema);
