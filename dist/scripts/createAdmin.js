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
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_1 = __importDefault(require("../models/Admin"));
const config_1 = require("../config");
function createAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(config_1.config.mongoUri);
            console.log('Connected to MongoDB Atlas');
            // Create admin user
            const adminData = {
                username: 'admin',
                password: 'admin123', // This will be hashed automatically by the model
                email: 'admin@example.com',
                role: 'super-admin'
            };
            // Check if admin already exists
            const existingAdmin = yield Admin_1.default.findOne({ username: adminData.username });
            if (existingAdmin) {
                console.log('Admin user already exists');
                process.exit(0);
            }
            // Create new admin
            const admin = new Admin_1.default(adminData);
            yield admin.save();
            console.log('Admin user created successfully');
        }
        catch (error) {
            console.error('Error creating admin:', error);
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
createAdmin();
