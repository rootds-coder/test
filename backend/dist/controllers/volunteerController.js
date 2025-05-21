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
exports.updateVolunteerHours = exports.deleteVolunteer = exports.updateVolunteer = exports.createVolunteer = exports.getVolunteerById = exports.getAllVolunteers = void 0;
const Volunteer_1 = __importDefault(require("../models/Volunteer"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const asyncHandler_1 = require("../utils/asyncHandler");
// Get all volunteers
exports.getAllVolunteers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const volunteers = yield Volunteer_1.default.find().sort({ createdAt: -1 });
    res.status(200).json(volunteers);
}));
// Get single volunteer by ID
exports.getVolunteerById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const volunteer = yield Volunteer_1.default.findById(req.params.id);
    if (!volunteer) {
        throw new ApiError_1.default(404, 'Volunteer not found');
    }
    res.status(200).json(volunteer);
}));
// Create new volunteer
exports.createVolunteer = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, skills, availability } = req.body;
    // Check if volunteer with email already exists
    const existingVolunteer = yield Volunteer_1.default.findOne({ email });
    if (existingVolunteer) {
        throw new ApiError_1.default(400, 'Volunteer with this email already exists');
    }
    const volunteer = yield Volunteer_1.default.create({
        name,
        email,
        phone,
        skills: Array.isArray(skills) ? skills : skills.split(',').map((skill) => skill.trim()),
        availability,
        status: 'active',
        joinedDate: new Date(),
        totalHours: 0,
    });
    res.status(201).json(volunteer);
}));
// Update volunteer
exports.updateVolunteer = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, skills, availability, status } = req.body;
    const volunteer = yield Volunteer_1.default.findById(req.params.id);
    if (!volunteer) {
        throw new ApiError_1.default(404, 'Volunteer not found');
    }
    // If email is being updated, check if new email already exists
    if (email && email !== volunteer.email) {
        const existingVolunteer = yield Volunteer_1.default.findOne({ email });
        if (existingVolunteer) {
            throw new ApiError_1.default(400, 'Volunteer with this email already exists');
        }
    }
    // Update only provided fields
    if (name)
        volunteer.name = name;
    if (email)
        volunteer.email = email;
    if (phone)
        volunteer.phone = phone;
    if (skills) {
        volunteer.skills = Array.isArray(skills) ? skills : skills.split(',').map((skill) => skill.trim());
    }
    if (availability)
        volunteer.availability = availability;
    if (status)
        volunteer.status = status;
    yield volunteer.save();
    res.status(200).json(volunteer);
}));
// Delete volunteer
exports.deleteVolunteer = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const volunteer = yield Volunteer_1.default.findById(req.params.id);
    if (!volunteer) {
        throw new ApiError_1.default(404, 'Volunteer not found');
    }
    yield volunteer.deleteOne();
    res.status(200).json({
        success: true,
        message: 'Volunteer deleted successfully',
    });
}));
// Update volunteer hours
exports.updateVolunteerHours = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hours } = req.body;
    if (typeof hours !== 'number' || hours < 0) {
        throw new ApiError_1.default(400, 'Invalid hours value');
    }
    const volunteer = yield Volunteer_1.default.findById(req.params.id);
    if (!volunteer) {
        throw new ApiError_1.default(404, 'Volunteer not found');
    }
    volunteer.totalHours = hours;
    yield volunteer.save();
    res.status(200).json(volunteer);
}));
