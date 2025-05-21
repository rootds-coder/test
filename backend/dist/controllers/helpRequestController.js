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
exports.deleteHelpRequest = exports.updateHelpRequestStatus = exports.getAllHelpRequests = exports.getHelpRequests = exports.createHelpRequest = void 0;
const HelpRequest_1 = __importDefault(require("../models/HelpRequest"));
const createHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, email, name } = req.body;
        const helpRequest = new HelpRequest_1.default({
            title,
            description,
            email,
            name,
            status: 'pending'
        });
        yield helpRequest.save();
        res.status(201).json(helpRequest);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating help request', error });
    }
});
exports.createHelpRequest = createHelpRequest;
const getHelpRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.query;
        const query = email ? { email } : {};
        const requests = yield HelpRequest_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching help requests', error });
    }
});
exports.getHelpRequests = getHelpRequests;
const getAllHelpRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const helpRequests = yield HelpRequest_1.default.find().sort({ createdAt: -1 });
        res.status(200).json(helpRequests);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching help requests', error });
    }
});
exports.getAllHelpRequests = getAllHelpRequests;
const updateHelpRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Calculate deletion date if status is resolved
        const update = { status };
        if (status === 'resolved') {
            const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            update.deletionDate = new Date(Date.now() + oneWeek);
        }
        else {
            // If status is changed back to pending/inProgress, remove deletion date
            update.$unset = { deletionDate: 1 };
        }
        const helpRequest = yield HelpRequest_1.default.findByIdAndUpdate(id, update, { new: true });
        if (!helpRequest) {
            res.status(404).json({ message: 'Help request not found' });
            return;
        }
        res.status(200).json(helpRequest);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating help request status', error });
    }
});
exports.updateHelpRequestStatus = updateHelpRequestStatus;
const deleteHelpRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const helpRequest = yield HelpRequest_1.default.findByIdAndDelete(id);
        if (!helpRequest) {
            res.status(404).json({ message: 'Help request not found' });
            return;
        }
        res.status(200).json({ message: 'Help request deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting help request', error });
    }
});
exports.deleteHelpRequest = deleteHelpRequest;
