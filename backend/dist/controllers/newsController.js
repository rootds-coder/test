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
exports.getNews = exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsById = exports.getAllNews = void 0;
const News_1 = __importDefault(require("../models/News"));
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
// Get all news articles with optional filters
exports.getAllNews = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, category } = req.query;
    const query = {};
    if (status)
        query.status = status;
    if (category)
        query.category = category;
    const news = yield News_1.default.find(query).sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        message: 'News retrieved successfully',
        data: news
    });
}));
// Get a single news article by ID
exports.getNewsById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield News_1.default.findById(req.params.id);
    if (!news) {
        throw new ApiError_1.default(404, 'News article not found');
    }
    res.status(200).json({
        success: true,
        message: 'News article retrieved successfully',
        data: news
    });
}));
// Create a new news article
exports.createNews = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, summary, image, author, category, status } = req.body;
    if (!title || !content || !summary) {
        throw new ApiError_1.default(400, 'Title, content and summary are required');
    }
    const news = yield News_1.default.create({
        title,
        content,
        summary,
        image,
        author,
        category,
        status: status || 'draft',
        date: new Date().toISOString()
    });
    res.status(201).json({
        success: true,
        message: 'News article created successfully',
        data: news
    });
}));
// Update a news article
exports.updateNews = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield News_1.default.findById(req.params.id);
    if (!news) {
        throw new ApiError_1.default(404, 'News article not found');
    }
    const updatedNews = yield News_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }), { new: true, runValidators: true });
    res.status(200).json({
        success: true,
        message: 'News article updated successfully',
        data: updatedNews
    });
}));
// Delete a news article
exports.deleteNews = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield News_1.default.findById(req.params.id);
    if (!news) {
        throw new ApiError_1.default(404, 'News article not found');
    }
    yield news.deleteOne();
    res.status(200).json({
        success: true,
        message: 'News article deleted successfully'
    });
}));
const getNews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, category } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (category)
            query.category = category;
        const news = yield News_1.default.find(query).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: 'News retrieved successfully',
            data: news
        });
    }
    catch (error) {
        throw new ApiError_1.default(500, 'Error retrieving news');
    }
});
exports.getNews = getNews;
