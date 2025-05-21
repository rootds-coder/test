import { Request, Response } from 'express';
import ApiError from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';
import { Payment } from '../models/Payment';
import { Donation } from '../models/Donation';
import { Fund } from '../models/Fund';
import QRCode from 'qrcode';

// Predefined donation amounts
const DONATION_AMOUNTS = [
  { value: 100, label: '₹100' },
  { value: 500, label: '₹500' },
  { value: 1000, label: '₹1000' },
  { value: 2000, label: '₹2000' },
  { value: 5000, label: '₹5000' },
  { value: 10000, label: '₹10000' },
];

export const getDonationAmounts = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    amounts: DONATION_AMOUNTS
  });
});

export const generateQR = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Invalid amount. Please provide a valid positive number.');
    }

    // Create UPI URL with organization's UPI ID
    const upiUrl = `upi://pay?pa=${process.env.UPI_ID}&pn=Root%20Coder%20Foundation&am=${amount}&cu=INR&tn=Donation`;
    
    try {
      // Generate QR code
      const qrCode = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      res.json({
        success: true,
        qrCode: qrCode,
        amount: Number(amount),
        upiUrl: upiUrl
      });
    } catch (qrError) {
      console.error('QR generation error:', qrError);
      throw new ApiError(500, 'Failed to generate QR code. Please try again.');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Payment error:', error);
    throw new ApiError(500, 'An error occurred while processing your request.');
  }
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { amount, transactionId, donorName, email, phone, purpose } = req.body;
    console.log('Received payment verification request:', {
      amount,
      transactionId,
      donorName,
      email,
      phone,
      purpose
    });

    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Invalid amount');
    }

    if (!transactionId) {
      throw new ApiError(400, 'Transaction ID is required');
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      console.log('Payment already exists:', existingPayment);
      return res.json({
        success: true,
        message: 'Payment already verified',
        payment: existingPayment
      });
    }

    console.log('Creating new payment record...');
    // Create payment record
    const payment = await Payment.create({
      amount,
      transactionId,
      status: 'completed',
      userId: req.user?.id || null // Allow null for anonymous donations
    });
    console.log('Payment record created:', payment);

    console.log('Creating donation record...');
    // Create donation record
    const donation = await Donation.create({
      amount,
      transactionId,
      status: 'completed',
      paymentMethod: 'upi',
      donor: {
        name: donorName || 'Anonymous',
        email: email || '',
        phone: phone || ''
      },
      purpose: purpose || 'General'
    });
    console.log('Donation record created:', donation);

    // Update active fund
    console.log('Updating active fund...');
    const activeFund = await Fund.findOne({ status: 'active' });
    if (!activeFund) {
      console.error('No active fund found');
      throw new ApiError(400, 'No active fund found');
    }

    // Update fund's current amount
    const previousAmount = activeFund.currentAmount || 0;
    activeFund.currentAmount = previousAmount + amount;
    await activeFund.save();
    console.log('Fund updated:', {
      fundId: activeFund._id,
      previousAmount,
      newAmount: activeFund.currentAmount
    });

    return res.json({
      success: true,
      message: 'Payment verified and donation processed successfully',
      payment,
      donation
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to process payment and donation');
  }
}); 