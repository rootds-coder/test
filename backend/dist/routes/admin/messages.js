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
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const Message_1 = __importDefault(require("../../models/Message"));
const router = express_1.default.Router();
// Get all messages
router.get('/', auth_1.authenticateAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.default.find()
            .sort({ createdAt: -1 });
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
}));
// Update message status
router.put('/:id/status', auth_1.authenticateAdmin, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const message = yield Message_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }
        res.json(message);
    }
    catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ message: 'Error updating message status' });
    }
})));
// Delete message
router.delete('/:id', auth_1.authenticateAdmin, (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield Message_1.default.findByIdAndDelete(req.params.id);
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
})));
exports.default = router;
