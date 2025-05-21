import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { verifyJWT } from '../middleware/auth';
import { config } from '../config';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    userId: string;
  };
}

// Login route
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check password
    const isValidPassword = await (user as any).comparePassword(password);
    
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: (user as any).role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: (user as any).role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
}));

// Register route
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
}));

// Get current user profile
router.get('/profile', verifyJWT, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'An error occurred while fetching profile' });
  }
}));

// Update user profile
router.put('/profile', verifyJWT, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      $or: [
        { username, _id: { $ne: user._id } },
        { email, _id: { $ne: user._id } }
      ]
    });

    if (existingUser) {
      res.status(400).json({ 
        message: 'Username or email is already taken' 
      });
      return;
    }

    user.username = username;
    user.email = email;
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: (user as any).role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'An error occurred while updating profile' });
  }
}));

// Change password
router.put('/change-password', verifyJWT, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify current password
    const isValidPassword = await (user as any).comparePassword(currentPassword);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    (user as any).password = newPassword;
    await (user as any).save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'An error occurred while changing password' });
  }
}));

export default router; 