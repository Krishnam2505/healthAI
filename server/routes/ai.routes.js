import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import Cycle from '../models/Cycle.js';
import { generateWeeklyPlan, chatWithNutritionist } from '../services/gemini.service.js';

const router = express.Router();

// Both of our AI routes require the user to be securely logged in
router.use(authMiddleware);

// POST /api/ai/weekly-plan
router.post('/weekly-plan', async (req, res) => {
  try {
    // 1. Fetch the user's basic profile details (Name, Goal, Calorie Target)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Figure out the 7-day window
    const startOf7DaysAgo = new Date();
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6);
    startOf7DaysAgo.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const query = {
      userId: req.userId,
      date: { $gte: startOf7DaysAgo, $lte: endOfToday }
    };

    // 3. Fetch all their meals and workouts from the last week in parallel
    const [last7DaysWorkouts, last7DaysMeals] = await Promise.all([
      Workout.find(query).sort({ date: -1 }),
      Meal.find(query).sort({ date: -1 })
    ]);

    let last7DaysCycle = [];
    if (user.gender === 'female') {
      last7DaysCycle = await Cycle.find(query).sort({ date: -1 });
    }

    // 4. Build the massive userData object that Gemini needs to read
    const userData = {
      name: user.name,
      goal: user.goal,
      gender: user.gender,
      dailyCalorieTarget: user.dailyCalorieTarget,
      last7DaysWorkouts,
      // We only pass the 15 most recent meals. If they logged 50 meals, the prompt would be 
      // too huge and Gemini might get confused or hit a token limit.
      last7DaysMeals: last7DaysMeals.slice(0, 15),
      last7DaysCycle
    };

    // 5. Hand the data to our Gemini Service and wait for it to generate the JSON plan
    const plan = await generateWeeklyPlan(userData);
    
    // 6. Return the plan to the frontend
    // We check plan.weeklyPlan just in case Gemini accidentally nested the JSON differently
    return res.status(200).json({ plan: plan.weeklyPlan || plan });
  } catch (error) {
    console.error('Error generating plan:', error);
    return res.status(500).json({ message: 'Failed to generate plan', error: error.message });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    // 1. Grab the chat history and the user's context off the incoming request
    const { messages, userContext } = req.body;

    // 2. Make sure the frontend actually sent us an array of messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages array is required' });
    }

    // 3. Hand it to our Gemini Service to do the talking
    const reply = await chatWithNutritionist(messages, userContext);
    
    // 4. Send the AI's response text back to the frontend
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('AI chat failed:', error);
    return res.status(500).json({ message: 'AI chat failed', error: error.message });
  }
});

export default router;
