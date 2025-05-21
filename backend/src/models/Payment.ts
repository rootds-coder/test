import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  amount: number;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  userId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
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
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Create the model
const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export { Payment }; 