import mongoose from 'mongoose';

const waterSchema = new mongoose.Schema({
  // Link to the user who logged this water intake
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // How many liters of water were consumed in this log entry
  liters: {
    type: Number,
    required: true
  },
  // When the water was consumed
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Water', waterSchema);
