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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDonations = exports.updateDonationStatus = exports.createDonation = void 0;
const Donation_1 = require("../models/Donation");
const Fund_1 = require("../models/Fund");
const createDonation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, donorName, email, phone, paymentMethod, transactionId } = req.body;
        const donation = new Donation_1.Donation({
            amount,
            donor: {
                name: donorName,
                email,
                phone
            },
            paymentMethod,
            transactionId,
            status: 'pending'
        });
        yield donation.save();
        res.status(201).json({ donation });
    }
    catch (error) {
        console.error('Create donation error:', error);
        res.status(500).json({ error: 'Failed to create donation' });
    }
});
exports.createDonation = createDonation;
const updateDonationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const donation = yield Donation_1.Donation.findById(id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }
        // Only update the fund amount if the donation is being marked as completed
        if (status === 'completed' && donation.status !== 'completed') {
            // Get the active fund
            const activeFund = yield Fund_1.Fund.findOne({ status: 'active' });
            if (!activeFund) {
                return res.status(400).json({ error: 'No active fund found' });
            }
            // Update the fund's current amount
            activeFund.currentAmount = (activeFund.currentAmount || 0) + donation.amount;
            yield activeFund.save();
        }
        // Update donation status
        donation.status = status;
        yield donation.save();
        res.json({ donation });
    }
    catch (error) {
        console.error('Update donation status error:', error);
        res.status(500).json({ error: 'Failed to update donation status' });
    }
});
exports.updateDonationStatus = updateDonationStatus;
const getDonations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const donations = yield Donation_1.Donation.find()
            .sort({ createdAt: -1 })
            .populate('donor');
        res.json({ donations });
    }
    catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});
exports.getDonations = getDonations;
