"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRoutes = void 0;
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', newsController_1.getAllNews); // Get all news (with optional status filter)
router.get('/:id', newsController_1.getNewsById); // Get a single news article
// Protected routes (require authentication)
router.post('/', auth_1.auth, newsController_1.createNews); // Create a news article
router.put('/:id', auth_1.auth, newsController_1.updateNews); // Update a news article
router.delete('/:id', auth_1.auth, newsController_1.deleteNews); // Delete a news article
exports.newsRoutes = router;
