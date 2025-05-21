import express from 'express';
import { getDonationAmounts, generateQR, verifyPayment } from '../controllers/paymentController';

const router = express.Router();

// Public routes
router.get('/amounts', getDonationAmounts);
router.post('/qr/generate', generateQR);
router.post('/verify', verifyPayment);

export default router; 