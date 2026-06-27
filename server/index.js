import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/auth.routes.js';
import workoutRouter from './routes/workout.routes.js';
import mealRouter from './routes/meal.routes.js';
import sleepRoutes from './routes/sleep.routes.js';
import waterRoutes from './routes/water.routes.js';
import cycleRoutes from './routes/cycle.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import aiRouter from './routes/ai.routes.js';

// 1. Load environment variables
dotenv.config();

// 3. Create an Express app
const app = express();

// 4. Add middleware
// We accept requests from the deployed client (CLIENT_URL) or localhost for development
app.use(cors({ 
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ['http://localhost:5173'], 
  credentials: true 
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutRouter);
app.use('/api/meals', mealRouter);
app.use('/api/sleep', sleepRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai', aiRouter);

// 5. Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'Health Tracker API is running' });
});

// 5.1 Catch-all 404 handler (must come AFTER all registered routes)
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// 5.2 Global Error Handler (must be the absolute last middleware)
// By taking exactly 4 parameters, Express knows this is a special error handling function
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    // We only send the raw stack trace to the frontend if we are on our local computer (development).
    // In production, sending a stack trace is a massive security risk as it exposes our server structure!
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
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
