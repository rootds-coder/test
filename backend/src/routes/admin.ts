import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import News from '../models/News';
import { Donation } from '../models/Donation';
import { Fund } from '../models/Fund';
import { authenticateAdmin } from '../middleware/auth';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

// Admin Login
router.post('/login', asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.json({ token, role: admin.role });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

// Get Dashboard Stats
router.get('/stats', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    // Get all donations and calculate totals
    const totalDonations = await Donation.countDocuments();
    const successfulDonations = await Donation.countDocuments({ status: 'completed' });
    
    // Get active fund first
    const activeFund = await Fund.findOne({ status: 'active' });
    if (!activeFund) {
      res.status(400).json({ message: 'No active fund found' });
      return;
    }

    // Use the fund's current amount as the source of truth
    const totalAmount = activeFund.currentAmount || 0;
    
    // Get active news count
    const activeNews = await News.countDocuments({ status: 'published' });
    
    // Calculate average donation
    const averageDonation = successfulDonations > 0 
      ? totalAmount / successfulDonations 
      : 0;

    // Get monthly donation trends
    const monthlyDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' }
            ]
          },
          amount: '$total'
        }
      }
    ]);

    // Get donation distribution by purpose
    const donationDistribution = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $ifNull: ['$purpose', 'General'] },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Log the calculated values for debugging
    console.log('Stats calculation:', {
      totalDonations,
      successfulDonations,
      totalAmount,
      activeFund: {
        currentAmount: activeFund.currentAmount,
        targetAmount: activeFund.targetAmount,
        progress: (activeFund.currentAmount / activeFund.targetAmount) * 100
      }
    });

    res.json({
      totalDonations,
      successfulDonations,
      totalAmount,
      averageDonation,
      activeNews,
      totalFunds: totalAmount, // Use the same amount for consistency
      availableBalance: 0, // Since we're using a single fund, there's no separate available balance
      activeFund: {
        currentAmount: activeFund.currentAmount,
        targetAmount: activeFund.targetAmount,
        progress: (activeFund.currentAmount / activeFund.targetAmount) * 100
      },
      monthlyDonations,
      donationDistribution
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

// News Management
router.post('/news', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { title, content, summary, image, category, status } = req.body;
    const news = new News({
      title,
      content,
      summary,
      image,
      category,
      status,
      author: req.user?.id
    });
    await news.save();
    res.status(201).json(news);
  } catch (error: any) {
    console.error('Create news error:', error);
    if (error?.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}));

router.get('/news', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const news = await News.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(news);
  } catch (error: any) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

router.put('/news/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { title, content, summary, image, category, status } = req.body;
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { title, content, summary, image, category, status },
      { new: true, runValidators: true }
    );
    if (!news) {
      res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (error: any) {
    console.error('Update news error:', error);
    if (error?.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
}));

router.delete('/news/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

// Donation Management
router.get('/donations', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    
    // Log the query parameters for debugging
    console.log('Fetching donations with query:', {
      page,
      limit,
      status,
      query
    });

    // Get all donations sorted by creation date (newest first)
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean(); // Use lean() for better performance

    // Log the found donations for debugging
    console.log(`Found ${donations.length} donations:`, donations);
    
    const total = await Donation.countDocuments(query);
    
    // Format the donations with all necessary details
    const formattedDonations = donations.map(donation => {
      // Log each donation for debugging
      console.log('Processing donation:', donation);
      
      return {
        id: donation._id,
        amount: donation.amount,
        status: donation.status,
        transactionId: donation.transactionId || `TRANS${Date.now()}${Math.floor(Math.random() * 1000)}`,
        paymentMethod: donation.paymentMethod || 'upi',
        donor: {
          name: donation.donor?.name || 'Anonymous',
          email: donation.donor?.email || 'N/A',
          phone: donation.donor?.phone || 'N/A'
        },
        purpose: donation.purpose || 'General',
        date: donation.createdAt,
        message: donation.message || ''
      };
    });

    // Log the response for debugging
    console.log('Sending response:', {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      donationsCount: formattedDonations.length,
      donations: formattedDonations
    });

    res.json({
      donations: formattedDonations,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error: any) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

router.put('/donations/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(donation);
  } catch (error: any) {
    console.error('Update donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

// Export donation data
router.get('/donations/export', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query: any = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (status) {
      query.status = status;
    }
    
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json(donations);
  } catch (error: any) {
    console.error('Export donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

// Fund Management
router.get('/funds', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const funds = await Fund.find().sort({ createdAt: -1 });
    res.json(funds);
  } catch (error: any) {
    console.error('Get funds error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

router.post('/funds', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { name, description, targetAmount, startDate, endDate, status } = req.body;

    // Validate required fields
    if (!name || !description || !targetAmount || !startDate || !endDate) {
      res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      res.status(400).json({ message: 'End date must be after start date' });
    }

    const fund = await Fund.create({
      name,
      description,
      targetAmount,
      startDate: start,
      endDate: end,
      status: status || 'pending',
      currentAmount: 0
    });

    res.status(201).json(fund);
  } catch (error: any) {
    console.error('Create fund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

router.put('/funds/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const { name, description, targetAmount, startDate, endDate, status } = req.body;

    // Validate required fields
    if (!name || !description || !targetAmount || !startDate || !endDate) {
      res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      res.status(400).json({ message: 'End date must be after start date' });
    }

    const fund = await Fund.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        targetAmount,
        startDate: start,
        endDate: end,
        status
      },
      { new: true }
    );

    if (!fund) {
      res.status(404).json({ message: 'Fund not found' });
    }

    res.json(fund);
  } catch (error: any) {
    console.error('Update fund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

router.delete('/funds/:id', authenticateAdmin, asyncHandler(async (req, res) => {
  try {
    const fund = await Fund.findByIdAndDelete(req.params.id);
    
    if (!fund) {
      res.status(404).json({ message: 'Fund not found' });
    }

    res.json({ message: 'Fund deleted successfully' });
  } catch (error: any) {
    console.error('Delete fund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}));

export default router;