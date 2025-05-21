"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const router = express_1.default.Router();
// Public routes
router.get('/amounts', paymentController_1.getDonationAmounts);
router.post('/qr/generate', paymentController_1.generateQR);
router.post('/verify', paymentController_1.verifyPayment);
exports.default = router;
