"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['contact', 'volunteer_request'],
        default: 'contact'
    },
    status: {
        type: String,
        enum: ['read', 'unread'],
        default: 'unread'
    },
    // Additional fields for volunteer requests
    skills: {
        type: String,
        required: false
    },
    availability: {
        type: String,
        enum: ['full-time', 'part-time', 'weekends'],
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
