import express from 'express';
import Meal from '../models/Meal.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authMiddleware to ALL routes in this file
// This ensures no one can create, read, or delete a meal without a valid JWT token.
router.use(authMiddleware);

// POST /api/meals - Log a new meal
router.post('/', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType, date } = req.body;

    const newMeal = new Meal({
      userId: req.userId, // Safely provided by authMiddleware
      name,
      calories,
      protein,
      carbs,
      fat,
      mealType,
      date: date ? new Date(date) : Date.now()
    });

    await newMeal.save();
    return res.status(201).json(newMeal);
  } catch (error) {
    console.error('Error logging meal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/meals - Fetch meals
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Strictly filter by the logged-in user's ID
    let query = { userId: req.userId };

    if (date) {
      // Find meals that happened between 00:00:00 and 23:59:59 of the requested day
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
      
      const meals = await Meal.find(query).sort({ date: -1 });
      return res.status(200).json(meals);
    } else {
      // If no specific date, return their 30 most recent meals
      const meals = await Meal.find(query).sort({ date: -1 }).limit(30);
      return res.status(200).json(meals);
    }
  } catch (error) {
    console.error('Error fetching meals:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/meals/:id - Delete a meal
router.delete('/:id', async (req, res) => {
  try {
    // Security Check: Match BOTH the meal ID and the logged-in user's ID
    const deletedMeal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deletedMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    return res.status(200).json({ message: 'Meal deleted' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/meals/:id - Update a meal
router.put('/:id', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, mealType, date } = req.body;
    
    const updateData = { name, calories, protein, carbs, fat, mealType };
    if (date) updateData.date = new Date(date);

    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMeal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    return res.status(200).json(updatedMeal);
  } catch (error) {
    console.error('Error updating meal:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
