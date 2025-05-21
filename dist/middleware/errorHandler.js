"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError_1.default) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            path: err.path || req.path
        });
        return;
    }
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            message: Object.values((err === null || err === void 0 ? void 0 : err.errors) || {}).map((error) => error.message),
            path: req.path
        });
        return;
    }
    // Handle mongoose duplicate key errors
    if (err.name === 'MongoError' && err.code === 11000) {
        res.status(400).json({
            success: false,
            message: 'Duplicate field value entered',
            path: req.path
        });
        return;
    }
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        path: req.path
    });
};
exports.default = errorHandler;
