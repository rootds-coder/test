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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaceData = exports.storeFaceData = exports.getFaceData = void 0;
const Face_1 = require("../models/Face");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.getFaceData = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const faceData = yield Face_1.Face.findOne({ userId });
    if (!faceData) {
        throw new ApiError_1.ApiError(404, 'No face data found');
    }
    res.json({ descriptor: faceData.descriptor });
}));
exports.storeFaceData = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { descriptor } = req.body;
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
        throw new ApiError_1.ApiError(400, 'Invalid face descriptor');
    }
    // Update or create face data
    const faceData = yield Face_1.Face.findOneAndUpdate({ userId }, { descriptor }, { new: true, upsert: true });
    res.json({ message: 'Face data stored successfully', faceData });
}));
exports.deleteFaceData = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield Face_1.Face.deleteOne({ userId });
    if (result.deletedCount === 0) {
        throw new ApiError_1.ApiError(404, 'No face data found');
    }
    res.json({ message: 'Face data deleted successfully' });
}));
