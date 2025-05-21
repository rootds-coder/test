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
const config_1 = require("../config");
const Fund_1 = __importDefault(require("../models/Fund"));
const createActiveFund = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('Connected to MongoDB');
        // Check if there's already an active fund
        const existingActiveFund = yield Fund_1.default.findOne({ status: 'active' });
        if (existingActiveFund) {
            console.log('Active fund already exists:', existingActiveFund);
            yield mongoose_1.default.disconnect();
            return;
        }
        // Create a new active fund
        const fund = yield Fund_1.default.create({
            name: 'General Donation Fund',
            description: 'Support our ongoing charitable initiatives and help make a difference in people\'s lives.',
            targetAmount: 1000000, // 10 lakhs
            currentAmount: 0,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        });
        console.log('Created new active fund:', fund);
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error creating active fund:', error);
        process.exit(1);
    }
});
// Run the script
createActiveFund();
