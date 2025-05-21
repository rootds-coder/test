import express from 'express';
import {
  getAllFunds,
  getFundById,
  createFund,
  updateFund,
  deleteFund,
  addDonation,
} from '../controllers/fundController';
import { verifyJWT } from '../middleware/auth';

const router = express.Router();

// Public route for donations
router.post('/donate', addDonation);

// All routes below require authentication
router.use(verifyJWT);

// Get all funds and create new fund
router
  .route('/')
  .get(getAllFunds)
  .post(createFund);

// Get, update and delete fund by ID
router
  .route('/:id')
  .get(getFundById)
  .put(updateFund)
  .delete(deleteFund);

export default router; 