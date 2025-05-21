import { Donation } from '../models/Donation';
import { Fund } from '../models/Fund';
import { Request, Response } from 'express';

export const createDonation = async (req: Request, res: Response) => {
  try {
    const { amount, donorName, email, phone, paymentMethod, transactionId } = req.body;
    
    const donation = new Donation({
      amount,
      donor: {
        name: donorName,
        email,
        phone
      },
      paymentMethod,
      transactionId,
      status: 'pending'
    });

    await donation.save();
    res.status(201).json({ donation });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
};

export const updateDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Only update the fund amount if the donation is being marked as completed
    if (status === 'completed' && donation.status !== 'completed') {
      // Get the active fund
      const activeFund = await Fund.findOne({ status: 'active' });
      if (!activeFund) {
        return res.status(400).json({ error: 'No active fund found' });
      }

      // Update the fund's current amount
      activeFund.currentAmount = (activeFund.currentAmount || 0) + donation.amount;
      await activeFund.save();
    }

    // Update donation status
    donation.status = status;
    await donation.save();

    res.json({ donation });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ error: 'Failed to update donation status' });
  }
};

export const getDonations = async (req: Request, res: Response) => {
  try {
    const donations = await Donation.find()
      .sort({ createdAt: -1 })
      .populate('donor');
    
    res.json({ donations });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
};