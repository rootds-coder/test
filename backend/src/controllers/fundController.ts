import { Request, Response } from 'express';
import { Fund, IFund } from '../models/Fund';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

// Add donation to fund
export const addDonation = asyncHandler(async (req: Request, res: Response) => {
  const { amount, donorName, email, paymentMethod, transactionId } = req.body;

  // Validate required fields
  if (!amount || !donorName || !email || !paymentMethod) {
    throw new ApiError(400, 'Missing required fields');
  }

  // Find active fund or create one if it doesn't exist
  let activeFund = await Fund.findOne({ status: 'active' });
  
  if (!activeFund) {
    // Create a new active fund
    activeFund = await Fund.create({
      name: 'General Donation Fund',
      description: 'Support our ongoing charitable initiatives and help make a difference in people\'s lives.',
      targetAmount: 1000000, // 10 lakhs
      currentAmount: 0,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    });
  }

  // Create donation record
  const donation = {
    amount,
    donorName,
    email,
    paymentMethod,
    transactionId,
    status: 'completed',
    createdAt: new Date(),
  };

  // Update fund amount
  activeFund.currentAmount += amount;

  // Check if fund target is reached
  if (activeFund.currentAmount >= activeFund.targetAmount) {
    activeFund.status = 'completed';
  }

  await activeFund.save();

  res.status(201).json({
    success: true,
    donation,
    fund: activeFund,
  });
});

// Get all funds
export const getAllFunds = asyncHandler(async (req: Request, res: Response) => {
  const funds = await Fund.find().sort({ createdAt: -1 });
  res.status(200).json(funds);
});

// Get single fund by ID
export const getFundById = asyncHandler(async (req: Request, res: Response) => {
  const fund = await Fund.findById(req.params.id);
  
  if (!fund) {
    throw new ApiError(404, 'Fund not found');
  }
  
  res.status(200).json(fund);
});

// Create new fund
export const createFund = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, targetAmount, startDate, endDate } = req.body;

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    throw new ApiError(400, 'End date must be after start date');
  }

  const fund = await Fund.create({
    name,
    description,
    targetAmount,
    startDate: start,
    endDate: end,
    status: 'pending', // Default status
    currentAmount: 0, // Initial amount
  });

  res.status(201).json(fund);
});

// Update fund
export const updateFund = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, targetAmount, startDate, endDate, status } = req.body;
  
  const fund = await Fund.findById(req.params.id);
  
  if (!fund) {
    throw new ApiError(404, 'Fund not found');
  }

  // If dates are being updated, validate them
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      throw new ApiError(400, 'End date must be after start date');
    }
  }

  // Update only provided fields
  if (name) fund.name = name;
  if (description) fund.description = description;
  if (targetAmount) fund.targetAmount = targetAmount;
  if (startDate) fund.startDate = new Date(startDate);
  if (endDate) fund.endDate = new Date(endDate);
  if (status) fund.status = status;

  await fund.save();
  
  res.status(200).json(fund);
});

// Delete fund
export const deleteFund = asyncHandler(async (req: Request, res: Response) => {
  const fund = await Fund.findById(req.params.id);
  
  if (!fund) {
    throw new ApiError(404, 'Fund not found');
  }

  // Check if fund has any donations before deletion
  if (fund.currentAmount > 0) {
    throw new ApiError(400, 'Cannot delete fund with existing donations');
  }

  await fund.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Fund deleted successfully',
  });
}); 