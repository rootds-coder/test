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
const donationController_1 = require("../controllers/donationController");
const auth_1 = require("../middleware/auth");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = express_1.default.Router();
// Public route for creating donations
router.post('/donations', donationController_1.createDonation);
// Admin routes (require authentication)
router.use(auth_1.verifyJWT);
router.get('/admin/donations', donationController_1.getDonations);
router.put('/admin/donations/:id/status', (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, donationController_1.updateDonationStatus)(req, res);
})));
exports.default = router;
