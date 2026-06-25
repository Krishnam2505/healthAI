import express from 'express';
import Water from '../models/Water.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authMiddleware to ALL routes in this file
// This ensures no one can log or view water without a valid JWT token.
router.use(authMiddleware);

// POST /api/water - Log water intake
router.post('/', async (req, res) => {
  try {
    const { liters, date } = req.body;

    // Custom Validation: You can't drink zero or negative amounts of water!
    if (liters <= 0) {
      return res.status(400).json({ message: 'Liters must be greater than 0' });
    }

    const newWater = new Water({
      userId: req.userId, // Safely provided by authMiddleware
      liters,
      date: date ? new Date(date) : Date.now()
    });

    await newWater.save();
    return res.status(201).json(newWater);
  } catch (error) {
    console.error('Error logging water:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/water - Fetch water logs
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Strictly filter by the logged-in user's ID
    let query = { userId: req.userId };

    if (date) {
      // Find water logged between 00:00:00 and 23:59:59 of the requested day
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
      
      const waterLogs = await Water.find(query).sort({ date: -1 });
      return res.status(200).json(waterLogs);
    } else {
      // If no specific date, just return their 7 most recent water logs
      const waterLogs = await Water.find(query).sort({ date: -1 }).limit(7);
      return res.status(200).json(waterLogs);
    }
  } catch (error) {
    console.error('Error fetching water logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/water/:id - Update a water log
router.put('/:id', async (req, res) => {
  try {
    const { liters, date } = req.body;
    
    // Safety check just like the POST route!
    if (liters !== undefined && liters <= 0) {
      return res.status(400).json({ message: 'Liters must be greater than 0' });
    }

    const updateData = { liters };
    if (date) updateData.date = new Date(date);

    const updatedWater = await Water.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedWater) {
      return res.status(404).json({ message: 'Water log not found' });
    }
    
    return res.status(200).json(updatedWater);
  } catch (error) {
    console.error('Error updating water log:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
