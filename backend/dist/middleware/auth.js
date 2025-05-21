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
exports.authenticateAdmin = exports.authenticateUser = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const Admin_1 = __importDefault(require("../models/Admin"));
const verifyJWT = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            throw new ApiError_1.default(401, 'No token provided');
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            userId: decoded.id // Using id as userId for consistency
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new ApiError_1.default(401, 'Invalid token'));
        }
        else {
            next(error);
        }
    }
};
exports.verifyJWT = verifyJWT;
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Authentication token required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = {
            userId: decoded.id,
            email: decoded.email || '',
            id: decoded.id,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid authentication token' });
    }
});
exports.authenticateUser = authenticateUser;
const authenticateAdmin = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return next(new ApiError_1.default(401, 'No token, authorization denied'));
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        Admin_1.default.findById(decoded.id).then(admin => {
            if (!admin) {
                return next(new ApiError_1.default(401, 'Token is not valid'));
            }
            req.user = {
                id: decoded.id,
                role: decoded.role,
                email: decoded.email || '',
                userId: decoded.id
            };
            next();
        }).catch(error => {
            console.error('Auth middleware error:', error);
            next(new ApiError_1.default(401, 'Token is not valid'));
        });
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        next(new ApiError_1.default(401, 'Token is not valid'));
    }
};
exports.authenticateAdmin = authenticateAdmin;
