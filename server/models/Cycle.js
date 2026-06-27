import mongoose from 'mongoose';

const cycleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  flowIntensity: {
    type: String,
    enum: ['None', 'Spotting', 'Light', 'Medium', 'Heavy'],
    default: 'None'
  },
  cramps: {
    type: String,
    enum: ['None', 'Mild', 'Severe'],
    default: 'None'
  },
  mood: {
    type: String,
    enum: ['Happy', 'Calm', 'Anxious', 'Tired', 'None'],
    default: 'None'
  },
  notes: {
    type: String
  }
});

export default mongoose.model('Cycle', cycleSchema);
