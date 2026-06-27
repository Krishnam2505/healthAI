import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import Sleep from '../models/Sleep.js';
import Water from '../models/Water.js';
import User from '../models/User.js';

const router = express.Router();

// Protect the entire dashboard with our bouncer
router.use(authMiddleware);

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    // 1. Calculate today's exact start and end millisecond
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const query = {
      userId: req.userId,
      date: { $gte: startOfToday, $lte: endOfToday }
    };

    // 2. Query all collections at the exact same time to make it extremely fast!
    const [workouts, meals, sleep, water, user] = await Promise.all([
      Workout.find(query),
      Meal.find(query),
      Sleep.find(query),
      Water.find(query),
      User.findById(req.userId) // We need the user's name and goals for the UI!
    ]);

    // 3. Calculate today's exact totals using array.reduce
    // .reduce works by taking a running total (starting at 0) and adding each item's value to it.
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);
    
    const caloriesBurned = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
    
    const waterLiters = water.reduce((sum, entry) => sum + entry.liters, 0);
    
    // Sum up sleep hours (if they logged multiple naps, it adds them all together)
    const sleepHours = sleep.reduce((sum, entry) => sum + entry.hours, 0);

    // --- 4. WEEKLY STATS (Last 7 Days) ---
    // Calculate 7 days ago
    const startOf7DaysAgo = new Date();
    startOf7DaysAgo.setDate(startOfToday.getDate() - 6);
    startOf7DaysAgo.setHours(0, 0, 0, 0);

    // Fetch all meals and workouts from the last 7 days in just 2 queries!
    const weeklyQuery = {
      userId: req.userId,
      date: { $gte: startOf7DaysAgo, $lte: endOfToday }
    };

    const [weeklyMeals, weeklyWorkouts] = await Promise.all([
      Meal.find(weeklyQuery),
      Workout.find(weeklyQuery)
    ]);

    const weekly = { labels: [], calories: [], workoutMinutes: [] };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Loop backwards from 6 days ago to today (0)
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(startOfToday.getDate() - i);
      
      weekly.labels.push(dayNames[targetDate.getDay()]); // E.g., 'Mon'

      // Filter the data we already downloaded in JS (much faster than asking the DB 7 times)
      const mealsThatDay = weeklyMeals.filter(meal => 
        new Date(meal.date).getDate() === targetDate.getDate() && 
        new Date(meal.date).getMonth() === targetDate.getMonth()
      );
      weekly.calories.push(mealsThatDay.reduce((sum, m) => sum + m.calories, 0));

      const workoutsThatDay = weeklyWorkouts.filter(workout => 
        new Date(workout.date).getDate() === targetDate.getDate() && 
        new Date(workout.date).getMonth() === targetDate.getMonth()
      );
      weekly.workoutMinutes.push(workoutsThatDay.reduce((sum, w) => sum + w.duration, 0));
    }

    // --- 5. STREAK CALCULATION ---
    let streakCount = 0;
    let checkDate = new Date(); // Start checking from today

    while (true) {
      const checkStart = new Date(checkDate);
      checkStart.setHours(0, 0, 0, 0);
      const checkEnd = new Date(checkDate);
      checkEnd.setHours(23, 59, 59, 999);

      // .exists() is a super fast Mongoose shortcut that just returns true or false
      const hasWorkout = await Workout.exists({
        userId: req.userId,
        date: { $gte: checkStart, $lte: checkEnd }
      });

      if (hasWorkout) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1); // Move back to yesterday
      } else {
        // If we found a day with no workout, the streak is officially broken. Stop counting!
        break;
      }
    }

    // 6. Send all sections back in one single, clean package!
    return res.status(200).json({
      today: {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        caloriesBurned,
        waterLiters,
        sleepHours: sleepHours > 0 ? sleepHours : null 
      },
      weekly,
      streak: { 
        current: streakCount,
        longest: streakCount // We'll just mirror current for now to avoid complex historical streak logic
      },
      user: {
        name: user.name,
        goal: user.goal,
        dailyCalorieTarget: user.dailyCalorieTarget
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
