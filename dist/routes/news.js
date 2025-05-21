"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const newsController_1 = require("../controllers/newsController");
const router = express_1.default.Router();
// Public routes
router.get('/', newsController_1.getAllNews); // Get all published news
router.get('/:id', newsController_1.getNewsById); // Get a specific news article
// Admin routes - protected by authentication and admin check
router.use(auth_1.verifyJWT);
router.use(auth_1.authenticateAdmin);
router.post('/', newsController_1.createNews); // Create a new news article
router.put('/:id', newsController_1.updateNews); // Update a news article
router.delete('/:id', newsController_1.deleteNews); // Delete a news article
exports.default = router;
