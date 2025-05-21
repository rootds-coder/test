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
exports.deleteFund = exports.updateFund = exports.createFund = exports.getFundById = exports.getAllFunds = exports.addDonation = void 0;
const Fund_1 = require("../models/Fund");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const asyncHandler_1 = require("../utils/asyncHandler");
// Add donation to fund
exports.addDonation = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, donorName, email, paymentMethod, transactionId } = req.body;
    // Validate required fields
    if (!amount || !donorName || !email || !paymentMethod) {
        throw new ApiError_1.default(400, 'Missing required fields');
    }
    // Find active fund or create one if it doesn't exist
    let activeFund = yield Fund_1.Fund.findOne({ status: 'active' });
    if (!activeFund) {
        // Create a new active fund
        activeFund = yield Fund_1.Fund.create({
            name: 'General Donation Fund',
            description: 'Support our ongoing charitable initiatives and help make a difference in people\'s lives.',
            targetAmount: 1000000, // 10 lakhs
            currentAmount: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        });
    }
    // Create donation record
    const donation = {
        amount,
        donorName,
        email,
        paymentMethod,
        transactionId,
        status: 'completed',
        createdAt: new Date(),
    };
    // Update fund amount
    activeFund.currentAmount += amount;
    // Check if fund target is reached
    if (activeFund.currentAmount >= activeFund.targetAmount) {
        activeFund.status = 'completed';
    }
    yield activeFund.save();
    res.status(201).json({
        success: true,
        donation,
        fund: activeFund,
    });
}));
// Get all funds
exports.getAllFunds = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const funds = yield Fund_1.Fund.find().sort({ createdAt: -1 });
    res.status(200).json(funds);
}));
// Get single fund by ID
exports.getFundById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fund = yield Fund_1.Fund.findById(req.params.id);
    if (!fund) {
        throw new ApiError_1.default(404, 'Fund not found');
    }
    res.status(200).json(fund);
}));
// Create new fund
exports.createFund = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, targetAmount, startDate, endDate } = req.body;
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
        throw new ApiError_1.default(400, 'End date must be after start date');
    }
    const fund = yield Fund_1.Fund.create({
        name,
        description,
        targetAmount,
        startDate: start,
        endDate: end,
        status: 'pending', // Default status
        currentAmount: 0, // Initial amount
    });
    res.status(201).json(fund);
}));
// Update fund
exports.updateFund = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, targetAmount, startDate, endDate, status } = req.body;
    const fund = yield Fund_1.Fund.findById(req.params.id);
    if (!fund) {
        throw new ApiError_1.default(404, 'Fund not found');
    }
    // If dates are being updated, validate them
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            throw new ApiError_1.default(400, 'End date must be after start date');
        }
    }
    // Update only provided fields
    if (name)
        fund.name = name;
    if (description)
        fund.description = description;
    if (targetAmount)
        fund.targetAmount = targetAmount;
    if (startDate)
        fund.startDate = new Date(startDate);
    if (endDate)
        fund.endDate = new Date(endDate);
    if (status)
        fund.status = status;
    yield fund.save();
    res.status(200).json(fund);
}));
// Delete fund
exports.deleteFund = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fund = yield Fund_1.Fund.findById(req.params.id);
    if (!fund) {
        throw new ApiError_1.default(404, 'Fund not found');
    }
    // Check if fund has any donations before deletion
    if (fund.currentAmount > 0) {
        throw new ApiError_1.default(400, 'Cannot delete fund with existing donations');
    }
    yield fund.deleteOne();
    res.status(200).json({
        success: true,
        message: 'Fund deleted successfully',
    });
}));
