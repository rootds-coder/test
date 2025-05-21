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
const express_1 = __importDefault(require("express"));
const qrcode_1 = __importDefault(require("qrcode"));
const config_1 = require("../config");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
// Generate QR code for payment
router.post('/generate', (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received request to generate QR code:', req.body);
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error('Invalid amount:', amount);
        throw new ApiError_1.default(400, 'Invalid amount. Please provide a valid positive number.');
    }
    // Get UPI ID from config
    const upiId = config_1.config.upiId;
    console.log('Using UPI ID:', upiId);
    if (!upiId || upiId === 'default-upi@bank') {
        console.error('UPI ID not configured properly');
        throw new ApiError_1.default(500, 'UPI ID not properly configured. Please set the UPI_ID environment variable.');
    }
    // Create UPI payment URL with proper formatting
    const formattedAmount = Number(amount).toFixed(2); // Ensure 2 decimal places
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('Fund Source')}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent('Donation')}`;
    console.log('Generated UPI URL:', upiUrl);
    try {
        // Generate QR code with better options
        const qrCode = yield qrcode_1.default.toDataURL(upiUrl, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 400,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        console.log('QR code generated successfully');
        res.json({
            success: true,
            qrCode,
            amount: Number(formattedAmount),
            upiUrl // Include the URL for debugging
        });
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        throw new ApiError_1.default(500, 'Failed to generate QR code');
    }
})));
exports.default = router;
