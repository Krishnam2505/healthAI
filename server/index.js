import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth.routes.js';
import workoutRouter from './routes/workout.routes.js';
import mealRouter from './routes/meal.routes.js';
import sleepRouter from './routes/sleep.routes.js';
import waterRouter from './routes/water.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import aiRouter from './routes/ai.routes.js';

// 1. Load environment variables
dotenv.config();

// 3. Create an Express app
const app = express();

// 4. Add middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutRouter);
app.use('/api/meals', mealRouter);
app.use('/api/sleep', sleepRouter);
app.use('/api/water', waterRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai', aiRouter);

// 5. Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'Health Tracker API is running' });
});

// 6. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// 7. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
