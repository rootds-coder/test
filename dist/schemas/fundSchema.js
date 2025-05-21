"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFundSchema = exports.createFundSchema = void 0;
const zod_1 = require("zod");
exports.createFundSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Fund name is required'),
    description: zod_1.z.string().min(1, 'Fund description is required'),
    targetAmount: zod_1.z.number().min(0, 'Target amount cannot be negative'),
    startDate: zod_1.z.string().transform((val) => new Date(val)),
    endDate: zod_1.z.string().transform((val) => new Date(val)),
});
exports.updateFundSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Fund name is required').optional(),
    description: zod_1.z.string().min(1, 'Fund description is required').optional(),
    targetAmount: zod_1.z.number().min(0, 'Target amount cannot be negative').optional(),
    startDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
    endDate: zod_1.z.string().transform((val) => new Date(val)).optional(),
    status: zod_1.z.enum(['active', 'completed', 'pending']).optional(),
});
