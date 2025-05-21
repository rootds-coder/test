"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVolunteerHoursSchema = exports.updateVolunteerSchema = exports.createVolunteerSchema = void 0;
const zod_1 = require("zod");
const volunteerCore = {
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().regex(/^\+?[\d\s-()]{10,}$/, 'Invalid phone number format'),
    skills: zod_1.z.array(zod_1.z.string()).min(1, 'At least one skill is required'),
    availability: zod_1.z.array(zod_1.z.string()).min(1, 'At least one availability slot is required'),
    status: zod_1.z.enum(['active', 'inactive', 'pending']).default('pending'),
};
exports.createVolunteerSchema = zod_1.z.object({
    body: zod_1.z.object(Object.assign({}, volunteerCore)),
});
exports.updateVolunteerSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object(Object.assign({}, volunteerCore)).partial(),
});
exports.updateVolunteerHoursSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        hours: zod_1.z.number().min(0, 'Hours cannot be negative'),
    }),
});
