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
const mongoose_1 = __importDefault(require("mongoose"));
const Donation_1 = __importDefault(require("../models/Donation"));
const Fund_1 = __importDefault(require("../models/Fund"));
const config_1 = require("../config");
function createSampleDonations() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(config_1.config.mongoUri);
            console.log('Connected to MongoDB Atlas');
            // Get active fund
            const activeFund = yield Fund_1.default.findOne({ status: 'active' });
            if (!activeFund) {
                console.error('No active fund found. Please create an active fund first.');
                return;
            }
            // Sample donations for the last 6 months
            const sampleDonations = [];
            const purposes = ['Education', 'Healthcare', 'Food', 'Shelter', 'Emergency Relief'];
            const now = new Date();
            // Create donations for each month (last 6 months)
            for (let i = 0; i < 6; i++) {
                const month = new Date(now);
                month.setMonth(month.getMonth() - i);
                // Create 5-10 donations for each month
                const numDonations = Math.floor(Math.random() * 6) + 5;
                for (let j = 0; j < numDonations; j++) {
                    const amount = Math.floor(Math.random() * 900) + 100; // Random amount between 100-1000
                    const donation = {
                        amount,
                        transactionId: `TRANS${i}${j}${Date.now()}${Math.floor(Math.random() * 1000)}`,
                        purpose: purposes[Math.floor(Math.random() * purposes.length)],
                        status: 'completed',
                        paymentMethod: 'upi', // lowercase as per enum
                        donor: {
                            name: `Donor ${i}-${j}`,
                            email: `donor${i}${j}@example.com`,
                            phone: `98765${i}${j}${Math.floor(Math.random() * 1000)}`
                        },
                        anonymous: false,
                        message: `Sample donation message ${i}-${j}`,
                        createdAt: month,
                        updatedAt: month
                    };
                    sampleDonations.push(donation);
                }
            }
            // Clear existing donations
            yield Donation_1.default.deleteMany({});
            console.log('Cleared existing donations');
            // Insert sample donations
            const createdDonations = yield Donation_1.default.insertMany(sampleDonations);
            console.log(`Created ${createdDonations.length} sample donations`);
            // Update fund's currentAmount
            const totalDonations = sampleDonations.reduce((sum, donation) => sum + donation.amount, 0);
            yield Fund_1.default.findByIdAndUpdate(activeFund._id, {
                $set: { currentAmount: totalDonations }
            });
            console.log(`Updated fund's current amount to: ${totalDonations}`);
            // Log some statistics
            const stats = {
                totalDonations: createdDonations.length,
                totalAmount: totalDonations,
                averageDonation: Math.floor(totalDonations / createdDonations.length),
                monthlyBreakdown: {}
            };
            // Calculate monthly breakdown
            createdDonations.forEach(donation => {
                const monthYear = `${donation.createdAt.getMonth() + 1}/${donation.createdAt.getFullYear()}`;
                if (!stats.monthlyBreakdown[monthYear]) {
                    stats.monthlyBreakdown[monthYear] = 0;
                }
                stats.monthlyBreakdown[monthYear] += donation.amount;
            });
            console.log('Donation Statistics:', stats);
        }
        catch (error) {
            console.error('Error creating sample donations:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB Atlas');
        }
    });
}
createSampleDonations();
