import express from 'express';
import Cycle from '../models/Cycle.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// POST /api/cycle - Log a new cycle symptom
router.post('/', async (req, res) => {
  try {
    const { flowIntensity, cramps, mood, notes, date } = req.body;

    const user = await User.findById(req.userId);
    if (!user || user.gender !== 'female') {
      return res.status(403).json({ message: 'Cycle tracking is only available for female profiles' });
    }

    const newCycle = new Cycle({
      userId: req.userId,
      flowIntensity,
      cramps,
      mood,
      notes,
      date: date ? new Date(date) : Date.now()
    });

    await newCycle.save();
    return res.status(201).json(newCycle);
  } catch (error) {
    console.error('Error logging cycle:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cycle - Fetch cycle logs
router.get('/', async (req, res) => {
  try {
    // We strictly filter by the logged-in user's ID
    const cycleLogs = await Cycle.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
    return res.status(200).json(cycleLogs);
  } catch (error) {
    console.error('Error fetching cycle logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/cycle/:id - Delete a cycle log
router.delete('/:id', async (req, res) => {
  try {
    const deletedCycle = await Cycle.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deletedCycle) {
      return res.status(404).json({ message: 'Cycle log not found' });
    }

    return res.status(200).json({ message: 'Cycle log deleted' });
  } catch (error) {
    console.error('Error deleting cycle log:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/cycle/:id - Update a cycle log
router.put('/:id', async (req, res) => {
  try {
    const { flowIntensity, cramps, mood, notes, date } = req.body;
    
    const updateData = { flowIntensity, cramps, mood, notes };
    if (date) updateData.date = new Date(date);

    const updatedCycle = await Cycle.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCycle) {
      return res.status(404).json({ message: 'Cycle log not found' });
    }
    
    return res.status(200).json(updatedCycle);
  } catch (error) {
    console.error('Error updating cycle log:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
