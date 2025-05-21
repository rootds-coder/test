import express from 'express';
import {
  createDonation,
  updateDonationStatus,
  getDonations
} from '../controllers/donationController';
import { verifyJWT } from '../middleware/auth';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Public route for creating donations
router.post('/donations', createDonation);

// Admin routes (require authentication)
router.use(verifyJWT);
router.get('/admin/donations', getDonations);
router.put('/admin/donations/:id/status', asyncHandler(async (req, res) => {
  await updateDonationStatus(req, res);
}));

export default router;