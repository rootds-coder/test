"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.generateQR = exports.getDonationAmounts = void 0;
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const Payment_1 = require("../models/Payment");
const Donation_1 = require("../models/Donation");
const Fund_1 = require("../models/Fund");
const qrcode_1 = __importDefault(require("qrcode"));
// Predefined donation amounts
const DONATION_AMOUNTS = [
    { value: 100, label: '₹100' },
    { value: 500, label: '₹500' },
    { value: 1000, label: '₹1000' },
    { value: 2000, label: '₹2000' },
    { value: 5000, label: '₹5000' },
    { value: 10000, label: '₹10000' },
];
exports.getDonationAmounts = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        success: true,
        amounts: DONATION_AMOUNTS
    });
}));
exports.generateQR = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            throw new ApiError_1.default(400, 'Invalid amount. Please provide a valid positive number.');
        }
        // Create UPI URL with organization's UPI ID
        const upiUrl = `upi://pay?pa=${process.env.UPI_ID}&pn=Root%20Coder%20Foundation&am=${amount}&cu=INR&tn=Donation`;
        try {
            // Generate QR code
            const qrCode = yield qrcode_1.default.toDataURL(upiUrl, {
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
        }
        catch (qrError) {
            console.error('QR generation error:', qrError);
            throw new ApiError_1.default(500, 'Failed to generate QR code. Please try again.');
        }
    }
    catch (error) {
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        console.error('Payment error:', error);
        throw new ApiError_1.default(500, 'An error occurred while processing your request.');
    }
}));
exports.verifyPayment = (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
            throw new ApiError_1.default(400, 'Invalid amount');
        }
        if (!transactionId) {
            throw new ApiError_1.default(400, 'Transaction ID is required');
        }
        // Check if payment already exists
        const existingPayment = yield Payment_1.Payment.findOne({ transactionId });
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
        const payment = yield Payment_1.Payment.create({
            amount,
            transactionId,
            status: 'completed',
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null // Allow null for anonymous donations
        });
        console.log('Payment record created:', payment);
        console.log('Creating donation record...');
        // Create donation record
        const donation = yield Donation_1.Donation.create({
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
        const activeFund = yield Fund_1.Fund.findOne({ status: 'active' });
        if (!activeFund) {
            console.error('No active fund found');
            throw new ApiError_1.default(400, 'No active fund found');
        }
        // Update fund's current amount
        const previousAmount = activeFund.currentAmount || 0;
        activeFund.currentAmount = previousAmount + amount;
        yield activeFund.save();
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
    }
    catch (error) {
        console.error('Payment verification error:', error);
        if (error instanceof ApiError_1.default) {
            throw error;
        }
        throw new ApiError_1.default(500, 'Failed to process payment and donation');
    }
}));
