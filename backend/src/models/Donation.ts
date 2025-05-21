import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  amount: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'upi' | 'card' | 'netbanking';
  donor: {
    name: string;
    email: string;
    phone: string;
  };
  purpose: string;
  anonymous: boolean;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking'],
    default: 'upi'
  },
  donor: {
    name: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    }
  },
  purpose: {
    type: String,
    required: false
  },
  anonymous: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
donationSchema.index({ status: 1, createdAt: -1 });

const Donation = mongoose.model<IDonation>('Donation', donationSchema);

export { Donation }; 