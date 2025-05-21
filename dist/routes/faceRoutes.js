"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faceController_1 = require("../controllers/faceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.verifyJWT);
// Face verification routes
router.get('/', faceController_1.getFaceData);
router.post('/', faceController_1.storeFaceData);
router.delete('/', faceController_1.deleteFaceData);
exports.default = router;
