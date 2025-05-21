import mongoose from 'mongoose';
import { config } from '../config';
import { Fund } from '../models/Fund';

const createFakeFund = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Create a new active fund
    const fund = await Fund.create({
      name: 'Emergency Relief Fund',
      description: 'Support for immediate disaster relief and emergency assistance programs.',
      targetAmount: 500000, // 5 lakhs
      currentAmount: 0,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
    });

    console.log('Created new fund:', fund);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating fund:', error);
    process.exit(1);
  }
};

createFakeFund(); 