"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helpRequestController_1 = require("../controllers/helpRequestController");
const router = express_1.default.Router();
// Public routes
router.post('/', helpRequestController_1.createHelpRequest);
router.get('/', helpRequestController_1.getHelpRequests);
// Admin routes
router.get('/all', helpRequestController_1.getAllHelpRequests);
router.patch('/:id/status', helpRequestController_1.updateHelpRequestStatus);
router.delete('/:id', helpRequestController_1.deleteHelpRequest);
exports.default = router;
