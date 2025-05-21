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
const config_1 = require("../config");
const express_1 = __importDefault(require("express"));
const fundRoutes_1 = __importDefault(require("../routes/fundRoutes"));
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('Connected to MongoDB successfully');
        // Create a simple Express app to test routes
        const app = (0, express_1.default)();
        app.use('/api/funds', fundRoutes_1.default);
        // Test the /donate endpoint
        const server = app.listen(5001, () => {
            console.log('Test server running on port 5001');
            console.log('Available routes:');
            console.log('- POST /api/funds/donate');
            console.log('- GET /api/funds');
            console.log('- POST /api/funds');
            console.log('- GET /api/funds/:id');
            console.log('- PUT /api/funds/:id');
            console.log('- DELETE /api/funds/:id');
        });
        // Close the server after 5 seconds
        setTimeout(() => {
            server.close();
            mongoose_1.default.disconnect();
            console.log('Test server closed');
            console.log('Disconnected from MongoDB');
        }, 5000);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
// Run the test
testConnection();
