"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fundController_1 = require("../controllers/fundController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public route for donations
router.post('/donate', fundController_1.addDonation);
// All routes below require authentication
router.use(auth_1.verifyJWT);
// Get all funds and create new fund
router
    .route('/')
    .get(fundController_1.getAllFunds)
    .post(fundController_1.createFund);
// Get, update and delete fund by ID
router
    .route('/:id')
    .get(fundController_1.getFundById)
    .put(fundController_1.updateFund)
    .delete(fundController_1.deleteFund);
exports.default = router;
