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
const Message_1 = __importDefault(require("../models/Message"));
const router = express_1.default.Router();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, skills, availability, message, type, status } = req.body;
        // Create a new message with volunteer request details
        const volunteerRequest = new Message_1.default({
            name,
            email,
            phone,
            subject: 'Volunteer Application',
            message: `
Why I want to volunteer:
${message}

Skills: ${skills}
Availability: ${availability}
Phone: ${phone}
`,
            type: 'volunteer_request',
            status: 'unread',
            skills,
            availability
        });
        yield volunteerRequest.save();
        res.status(201).json({ message: 'Volunteer request submitted successfully' });
    }
    catch (error) {
        console.error('Error submitting volunteer request:', error);
        res.status(500).json({ message: 'Failed to submit volunteer request' });
    }
}));
exports.default = router;
