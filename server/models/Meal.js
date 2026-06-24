import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  // Link to the user who logged this meal
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The name of the food (e.g., 'Paneer Paratha', 'Protein Shake')
  name: {
    type: String,
    required: true
  },
  // Total calories in this meal
  calories: {
    type: Number,
    required: true
  },
  // Optional macro: Protein in grams
  protein: {
    type: Number
  },
  // Optional macro: Carbohydrates in grams
  carbs: {
    type: Number
  },
  // Optional macro: Fat in grams
  fat: {
    type: Number
  },
  // The category of the meal
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  // When the meal was eaten
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Meal', mealSchema);
