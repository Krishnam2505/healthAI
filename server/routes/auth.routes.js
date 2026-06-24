import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  try {
    // 1. Destructure { name, email, password, goal, dailyCalorieTarget } from req.body
    const { name, email, password, goal, dailyCalorieTarget } = req.body;

    // 2. Validate: if name, email, or password are missing
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // 3. Check if a user with this email already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create and save a new User document with the hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      goal,
      dailyCalorieTarget
    });
    await newUser.save();

    // 6. Generate a JWT
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Return 201 with: { token, user: { ... } }
    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        goal: newUser.goal,
        dailyCalorieTarget: newUser.dailyCalorieTarget
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    // 1. Destructure email and password from req.body
    const { email, password } = req.body;

    // 2. Validate missing fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 3. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // SECURITY NOTE: Why use "Invalid credentials" instead of "User not found"?
      // If we tell a hacker "User not found", they can keep guessing emails until they don't get that error,
      // which tells them exactly which emails are registered in our system. By always saying "Invalid credentials",
      // we never confirm or deny if an email exists in our database!
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Return 200 OK with token and user data
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goal: user.goal,
        dailyCalorieTarget: user.dailyCalorieTarget
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
// GET /me
// This route is protected by our authMiddleware!
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // 1. Use req.userId (which was attached by the middleware) to find the user
    // .select('-password') tells MongoDB to return the user but completely strip out the hashed password field!
    const user = await User.findById(req.userId).select('-password');

    // 2. If the user doesn't exist (e.g. they deleted their account while their token was still valid)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Return the clean user profile
    return res.status(200).json(user);

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
