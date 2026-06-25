import express from 'express';
import Workout from '../models/Workout.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authMiddleware to ALL routes in this file
// This ensures no one can create, read, or delete a workout without a valid JWT token.
router.use(authMiddleware);

// POST /api/workouts - Create a new workout
router.post('/', async (req, res) => {
  try {
    const { type, duration, caloriesBurned, notes, date } = req.body;

    const newWorkout = new Workout({
      userId: req.userId, // This is safely provided by our authMiddleware!
      type,
      duration,
      caloriesBurned,
      notes,
      date: date ? new Date(date) : Date.now()
    });

    await newWorkout.save();
    return res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/workouts - Fetch workouts
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    // We strictly filter by the logged-in user's ID
    let query = { userId: req.userId };

    if (date) {
      // If the frontend asked for a specific date (e.g., "?date=2024-10-15")
      // We must find any workout that falls between 00:00:00 and 23:59:59 of that day.
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay, // Greater than or equal to start of day
        $lte: endOfDay    // Less than or equal to end of day
      };
      
      const workouts = await Workout.find(query).sort({ date: -1 });
      return res.status(200).json(workouts);
    } else {
      // If no specific date was provided, just return their 30 most recent workouts.
      const workouts = await Workout.find(query).sort({ date: -1 }).limit(30);
      return res.status(200).json(workouts);
    }
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/workouts/:id - Delete a workout
router.delete('/:id', async (req, res) => {
  try {
    // SECURITY NOTE: Why do we check BOTH `_id` and `userId`?
    // If we only searched by `_id`, a malicious user could randomly guess the ID of SOMEONE ELSE'S workout
    // and delete it! By forcing the database to ensure the `userId` matches the person currently logged in,
    // we guarantee that users can ONLY ever delete their own data.
    const deletedWorkout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deletedWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    return res.status(200).json({ message: 'Workout deleted' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/workouts/:id - Update a workout
router.put('/:id', async (req, res) => {
  try {
    const { type, duration, caloriesBurned, notes, date } = req.body;
    
    // We create an update object. If the user didn't send a new date, we don't update the date.
    const updateData = { type, duration, caloriesBurned, notes };
    if (date) updateData.date = new Date(date);

    // findOneAndUpdate updates the document in a single step
    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // Security: Must match ID and Owner
      updateData, // The new data
      { new: true, runValidators: true } // Return the NEW updated version, and run Schema rules
    );

    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    return res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
