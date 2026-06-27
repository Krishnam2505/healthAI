import express from 'express';
import Sleep from '../models/Sleep.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authMiddleware to ALL routes in this file
// This ensures no one can log or view sleep without a valid JWT token.
router.use(authMiddleware);

// POST /api/sleep - Log a new sleep entry
router.post('/', async (req, res) => {
  try {
    const { hours, quality, date } = req.body;

    // Custom Validation: It's impossible to sleep more than 24 hours in a single day, or less than 0!
    if (hours < 0 || hours > 24) {
      return res.status(400).json({ message: 'Hours must be between 0 and 24' });
    }

    const newSleep = new Sleep({
      userId: req.userId, // Safely provided by authMiddleware
      hours,
      quality,
      date: date ? new Date(date) : Date.now()
    });

    await newSleep.save();
    return res.status(201).json(newSleep);
  } catch (error) {
    console.error('Error logging sleep:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sleep - Fetch sleep logs
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Strictly filter by the logged-in user's ID
    let query = { userId: req.userId };

    if (date) {
      // Find sleep logged between 00:00:00 and 23:59:59 of the requested day
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
      
      const sleepLogs = await Sleep.find(query).sort({ date: -1 });
      return res.status(200).json(sleepLogs);
    } else {
      // If no specific date, just return their 7 most recent sleep logs (1 week of data)
      const sleepLogs = await Sleep.find(query).sort({ date: -1 }).limit(7);
      return res.status(200).json(sleepLogs);
    }
  } catch (error) {
    console.error('Error fetching sleep logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sleep/:id - Delete a sleep log
router.delete('/:id', async (req, res) => {
  try {
    const deletedSleep = await Sleep.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deletedSleep) {
      return res.status(404).json({ message: 'Sleep log not found' });
    }

    return res.status(200).json({ message: 'Sleep log deleted' });
  } catch (error) {
    console.error('Error deleting sleep log:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sleep/:id - Update a sleep log
router.put('/:id', async (req, res) => {
  try {
    const { hours, quality, date } = req.body;
    
    // Safety check just like the POST route!
    if (hours !== undefined && (hours < 0 || hours > 24)) {
      return res.status(400).json({ message: 'Hours must be between 0 and 24' });
    }

    const updateData = { hours, quality };
    if (date) updateData.date = new Date(date);

    const updatedSleep = await Sleep.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSleep) {
      return res.status(404).json({ message: 'Sleep log not found' });
    }
    
    return res.status(200).json(updatedSleep);
  } catch (error) {
    console.error('Error updating sleep log:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
