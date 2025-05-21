"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const volunteerSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    availability: {
        type: String,
        enum: ['full-time', 'part-time', 'weekends'],
        default: 'full-time'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    joinedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
const Volunteer = mongoose_1.default.model('Volunteer', volunteerSchema);
exports.default = Volunteer;
