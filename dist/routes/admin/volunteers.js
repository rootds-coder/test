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
const auth_1 = require("../../middleware/auth");
const Volunteer_1 = __importDefault(require("../../models/Volunteer"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const router = express_1.default.Router();
// Get all volunteers
router.get('/', auth_1.authenticateAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteers = yield Volunteer_1.default.find().sort({ createdAt: -1 });
        res.json(volunteers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching volunteers' });
    }
}));
// Add new volunteer
router.post('/', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, skills, availability, status } = req.body;
        // Validate required fields
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email, and phone are required' });
        }
        const newVolunteer = new Volunteer_1.default({
            name,
            email,
            phone,
            skills: Array.isArray(skills) ? skills : [],
            availability,
            status,
            joinedDate: new Date()
        });
        const savedVolunteer = yield newVolunteer.save();
        res.status(201).json(savedVolunteer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding volunteer' });
    }
})));
// Update volunteer
router.put('/:id', auth_1.authenticateAdmin, (0, asyncHandler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, skills, availability, status } = req.body;
        const updatedVolunteer = yield Volunteer_1.default.findByIdAndUpdate(req.params.id, {
            name,
            email,
            phone,
            skills: Array.isArray(skills) ? skills : [],
            availability,
            status
        }, { new: true });
        if (!updatedVolunteer) {
            res.status(404).json({ message: 'Volunteer not found' });
        }
        res.json(updatedVolunteer);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating volunteer' });
    }
})));
// Delete volunteer
router.delete('/:id', auth_1.authenticateAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedVolunteer = yield Volunteer_1.default.findByIdAndDelete(req.params.id);
        if (!deletedVolunteer) {
            res.status(404).json({ message: 'Volunteer not found' });
        }
        res.json({ message: 'Volunteer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting volunteer' });
    }
}));
exports.default = router;
