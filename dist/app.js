"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const payment_1 = __importDefault(require("./routes/payment"));
const news_1 = __importDefault(require("./routes/news"));
const helpRequests_1 = __importDefault(require("./routes/helpRequests"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use((0, helmet_1.default)());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/payment', payment_1.default);
app.use('/api/news', news_1.default);
app.use('/api/help-requests', helpRequests_1.default);
// 404 handler
app.use((req, res, next) => {
    next(new ApiError_1.default(404, 'Resource not found'));
});
// Error handling
app.use(errorHandler_1.default);
exports.default = app;
