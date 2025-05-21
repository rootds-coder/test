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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const News_1 = __importDefault(require("../models/News"));
const createTestNews = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        yield mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('Connected to MongoDB');
        // Create test news articles
        const testArticles = [
            {
                title: 'Welcome to Root Coder Foundation',
                content: 'We are excited to announce the launch of Root Coder Foundation, dedicated to empowering young minds through technology education.',
                summary: 'Root Coder Foundation launches with a mission to provide tech education.',
                image: 'https://example.com/welcome.jpg',
                author: 'Admin',
                category: 'news',
                status: 'published',
                date: new Date(),
            },
            {
                title: 'New Coding Workshop Series',
                content: 'Join us for our upcoming series of coding workshops designed for beginners. Learn the basics of programming in a friendly environment.',
                summary: 'Free coding workshops for beginners starting next month.',
                image: 'https://example.com/workshop.jpg',
                author: 'Admin',
                category: 'update',
                status: 'published',
                date: new Date(),
            },
            {
                title: 'Student Success Story',
                content: 'Meet Sarah, one of our students who successfully completed our program and landed her first tech job.',
                summary: 'Inspiring story of a student\'s journey into tech.',
                image: 'https://example.com/success.jpg',
                author: 'Admin',
                category: 'story',
                status: 'published',
                date: new Date(),
            }
        ];
        // Insert the test articles
        yield News_1.default.insertMany(testArticles);
        console.log('Test news articles created successfully');
        // Disconnect from MongoDB
        yield mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
});
// Run the script
createTestNews();
