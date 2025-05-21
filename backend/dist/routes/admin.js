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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const News_1 = __importDefault(require("../models/News"));
const Donation_1 = require("../models/Donation");
const Fund_1 = require("../models/Fund");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
// Admin Login
router.post('/login', (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const admin = yield Admin_1.default.findOne({ username });
        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        // Update last login
        admin.lastLogin = new Date();
        yield admin.save();
        res.json({ token, role: admin.role });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
// Get Dashboard Stats
router.get('/stats', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all donations and calculate totals
        const totalDonations = yield Donation_1.Donation.countDocuments();
        const successfulDonations = yield Donation_1.Donation.countDocuments({ status: 'completed' });
        // Get active fund first
        const activeFund = yield Fund_1.Fund.findOne({ status: 'active' });
        if (!activeFund) {
            res.status(400).json({ message: 'No active fund found' });
            return;
        }
        // Use the fund's current amount as the source of truth
        const totalAmount = activeFund.currentAmount || 0;
        // Get active news count
        const activeNews = yield News_1.default.countDocuments({ status: 'published' });
        // Calculate average donation
        const averageDonation = successfulDonations > 0
            ? totalAmount / successfulDonations
            : 0;
        // Get monthly donation trends
        const monthlyDonations = yield Donation_1.Donation.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            {
                $project: {
                    _id: 0,
                    date: {
                        $concat: [
                            { $toString: '$_id.month' },
                            '/',
                            { $toString: '$_id.year' }
                        ]
                    },
                    amount: '$total'
                }
            }
        ]);
        // Get donation distribution by purpose
        const donationDistribution = yield Donation_1.Donation.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: { $ifNull: ['$purpose', 'General'] },
                    total: { $sum: '$amount' }
                }
            }
        ]);
        // Log the calculated values for debugging
        console.log('Stats calculation:', {
            totalDonations,
            successfulDonations,
            totalAmount,
            activeFund: {
                currentAmount: activeFund.currentAmount,
                targetAmount: activeFund.targetAmount,
                progress: (activeFund.currentAmount / activeFund.targetAmount) * 100
            }
        });
        res.json({
            totalDonations,
            successfulDonations,
            totalAmount,
            averageDonation,
            activeNews,
            totalFunds: totalAmount, // Use the same amount for consistency
            availableBalance: 0, // Since we're using a single fund, there's no separate available balance
            activeFund: {
                currentAmount: activeFund.currentAmount,
                targetAmount: activeFund.targetAmount,
                progress: (activeFund.currentAmount / activeFund.targetAmount) * 100
            },
            monthlyDonations,
            donationDistribution
        });
    }
    catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
// News Management
router.post('/news', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, content, summary, image, category, status } = req.body;
        const news = new News_1.default({
            title,
            content,
            summary,
            image,
            category,
            status,
            author: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
        });
        yield news.save();
        res.status(201).json(news);
    }
    catch (error) {
        console.error('Create news error:', error);
        if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
})));
router.get('/news', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield News_1.default.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(news);
    }
    catch (error) {
        console.error('Get news error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
router.put('/news/:id', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content, summary, image, category, status } = req.body;
        const news = yield News_1.default.findByIdAndUpdate(req.params.id, { title, content, summary, image, category, status }, { new: true, runValidators: true });
        if (!news) {
            res.status(404).json({ message: 'News not found' });
        }
        res.json(news);
    }
    catch (error) {
        console.error('Update news error:', error);
        if ((error === null || error === void 0 ? void 0 : error.name) === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
})));
router.delete('/news/:id', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield News_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'News deleted successfully' });
    }
    catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
// Donation Management
router.get('/donations', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};
        // Log the query parameters for debugging
        console.log('Fetching donations with query:', {
            page,
            limit,
            status,
            query
        });
        // Get all donations sorted by creation date (newest first)
        const donations = yield Donation_1.Donation.find(query)
            .sort({ createdAt: -1 }) // Most recent first
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .lean(); // Use lean() for better performance
        // Log the found donations for debugging
        console.log(`Found ${donations.length} donations:`, donations);
        const total = yield Donation_1.Donation.countDocuments(query);
        // Format the donations with all necessary details
        const formattedDonations = donations.map(donation => {
            var _a, _b, _c;
            // Log each donation for debugging
            console.log('Processing donation:', donation);
            return {
                id: donation._id,
                amount: donation.amount,
                status: donation.status,
                transactionId: donation.transactionId || `TRANS${Date.now()}${Math.floor(Math.random() * 1000)}`,
                paymentMethod: donation.paymentMethod || 'upi',
                donor: {
                    name: ((_a = donation.donor) === null || _a === void 0 ? void 0 : _a.name) || 'Anonymous',
                    email: ((_b = donation.donor) === null || _b === void 0 ? void 0 : _b.email) || 'N/A',
                    phone: ((_c = donation.donor) === null || _c === void 0 ? void 0 : _c.phone) || 'N/A'
                },
                purpose: donation.purpose || 'General',
                date: donation.createdAt,
                message: donation.message || ''
            };
        });
        // Log the response for debugging
        console.log('Sending response:', {
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            donationsCount: formattedDonations.length,
            donations: formattedDonations
        });
        res.json({
            donations: formattedDonations,
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    }
    catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
router.put('/donations/:id', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const donation = yield Donation_1.Donation.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(donation);
    }
    catch (error) {
        console.error('Update donation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
// Export donation data
router.get('/donations/export', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, status } = req.query;
        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (status) {
            query.status = status;
        }
        const donations = yield Donation_1.Donation.find(query)
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json(donations);
    }
    catch (error) {
        console.error('Export donations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
// Fund Management
router.get('/funds', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const funds = yield Fund_1.Fund.find().sort({ createdAt: -1 });
        res.json(funds);
    }
    catch (error) {
        console.error('Get funds error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
router.post('/funds', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, targetAmount, startDate, endDate, status } = req.body;
        // Validate required fields
        if (!name || !description || !targetAmount || !startDate || !endDate) {
            res.status(400).json({ message: 'Missing required fields' });
        }
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            res.status(400).json({ message: 'End date must be after start date' });
        }
        const fund = yield Fund_1.Fund.create({
            name,
            description,
            targetAmount,
            startDate: start,
            endDate: end,
            status: status || 'pending',
            currentAmount: 0
        });
        res.status(201).json(fund);
    }
    catch (error) {
        console.error('Create fund error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
router.put('/funds/:id', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, targetAmount, startDate, endDate, status } = req.body;
        // Validate required fields
        if (!name || !description || !targetAmount || !startDate || !endDate) {
            res.status(400).json({ message: 'Missing required fields' });
        }
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            res.status(400).json({ message: 'End date must be after start date' });
        }
        const fund = yield Fund_1.Fund.findByIdAndUpdate(req.params.id, {
            name,
            description,
            targetAmount,
            startDate: start,
            endDate: end,
            status
        }, { new: true });
        if (!fund) {
            res.status(404).json({ message: 'Fund not found' });
        }
        res.json(fund);
    }
    catch (error) {
        console.error('Update fund error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
router.delete('/funds/:id', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fund = yield Fund_1.Fund.findByIdAndDelete(req.params.id);
        if (!fund) {
            res.status(404).json({ message: 'Fund not found' });
        }
        res.json({ message: 'Fund deleted successfully' });
    }
    catch (error) {
        console.error('Delete fund error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})));
exports.default = router;
