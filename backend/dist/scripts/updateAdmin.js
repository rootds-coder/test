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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function updateAdminCredentials() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(config_1.config.mongoUri);
            console.log('Connected to MongoDB');
            // Hash the password
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash('dhruv', salt);
            // Find admin by username and update credentials
            const updatedAdmin = yield Admin_1.default.findOneAndUpdate({}, // This will update the first admin document
            {
                username: 'rootcoder',
                password: hashedPassword
            }, {
                new: true,
                upsert: true // Create if doesn't exist
            });
            console.log('Admin credentials updated successfully');
            console.log('Username:', updatedAdmin.username);
            // Disconnect from MongoDB
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
        catch (error) {
            console.error('Error updating admin credentials:', error);
        }
    });
}
// Run the update function
updateAdminCredentials();
