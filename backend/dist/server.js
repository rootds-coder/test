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
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_1 = __importDefault(require("./routes/auth"));
const payment_1 = __importDefault(require("./routes/payment"));
const qr_1 = __importDefault(require("./routes/qr"));
const admin_1 = __importDefault(require("./routes/admin"));
const volunteers_1 = __importDefault(require("./routes/admin/volunteers"));
const volunteer_requests_1 = __importDefault(require("./routes/volunteer-requests"));
const messages_1 = __importDefault(require("./routes/admin/messages"));
const news_1 = __importDefault(require("./routes/news"));
const helpRequests_1 = __importDefault(require("./routes/helpRequests"));
const fundRoutes_1 = __importDefault(require("./routes/fundRoutes"));
// Connect to MongoDB with retry logic
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('MongoDB Atlas Connected Successfully');
        // Create indexes if they don't exist
        const db = mongoose_1.default.connection.db;
        if (db) {
            yield db.collection('users').createIndex({ email: 1 }, { unique: true });
            yield db.collection('users').createIndex({ username: 1 }, { unique: true });
        }
        return conn;
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
        throw error;
    }
});
const app = (0, express_1.default)();
// Trust proxy - Add this line
app.set('trust proxy', 1);
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', config_1.config.corsOrigin].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parser middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// API Routes
app.use('/api/v1/help-requests', helpRequests_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/payment', payment_1.default);
app.use('/api/qr', qr_1.default);
app.use('/api/news', news_1.default);
app.use('/api/volunteer-requests', volunteer_requests_1.default);
app.use('/api/funds', fundRoutes_1.default);
// Admin routes
app.use('/api/admin', admin_1.default);
app.use('/api/admin/volunteers', volunteers_1.default);
app.use('/api/admin/messages', messages_1.default);
// Apply rate limiting to other API routes
app.use('/api/', rateLimiter_1.apiLimiter);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Handle undefined routes
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.path);
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});
// Start server only after database connection is established
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectDB();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});
startServer();
exports.default = app;
