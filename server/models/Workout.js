import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  // We use ObjectId and 'ref' instead of just storing the user's name to create a strict relational link.
  // If the user later changes their name or email, this workout will still be securely linked to their unique ID.
  // It also allows us to use Mongoose's .populate('userId') later to automatically fetch the full user details whenever we fetch a workout!
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The type of workout (e.g. 'Running', 'Gym', 'Cycling', 'Swimming')
  type: {
    type: String,
    required: true
  },
  // Duration of the workout in minutes
  duration: {
    type: Number,
    required: true
  },
  // Estimated calories burned during the workout
  caloriesBurned: {
    type: Number
  },
  // Any extra notes about the workout
  notes: {
    type: String
  },
  // When the workout actually happened (can be different from when the record was created)
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Workout', workoutSchema);
