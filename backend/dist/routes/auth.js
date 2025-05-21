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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const config_1 = require("../config");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = express_1.default.Router();
// Login route
router.post('/login', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check password
        const isValidPassword = yield user.comparePassword(password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, config_1.config.jwtSecret, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
})));
// Register route
router.post('/register', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // Check if user exists
        const existingUser = yield User_1.default.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        // Hash password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        // Create user
        const user = yield User_1.default.create({
            username,
            email,
            password: hashedPassword
        });
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.config.jwtSecret, { expiresIn: '1d' });
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
})));
// Get current user profile
router.get('/profile', auth_1.verifyJWT, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'An error occurred while fetching profile' });
    }
})));
// Update user profile
router.put('/profile', auth_1.verifyJWT, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, email } = req.body;
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Check if username or email is already taken by another user
        const existingUser = yield User_1.default.findOne({
            $or: [
                { username, _id: { $ne: user._id } },
                { email, _id: { $ne: user._id } }
            ]
        });
        if (existingUser) {
            res.status(400).json({
                message: 'Username or email is already taken'
            });
            return;
        }
        user.username = username;
        user.email = email;
        yield user.save();
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'An error occurred while updating profile' });
    }
})));
// Change password
router.put('/change-password', auth_1.verifyJWT, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Verify current password
        const isValidPassword = yield user.comparePassword(currentPassword);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Current password is incorrect' });
        }
        // Update password
        user.password = newPassword;
        yield user.save();
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'An error occurred while changing password' });
    }
})));
exports.default = router;
