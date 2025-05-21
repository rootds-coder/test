"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const volunteerController_1 = require("../controllers/volunteerController");
const auth_1 = require("../middleware/auth");
const validateResource_1 = require("../middleware/validateResource");
const volunteerSchema_1 = require("../schemas/volunteerSchema");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.verifyJWT);
// Get all volunteers and create new volunteer
router
    .route('/')
    .get(volunteerController_1.getAllVolunteers)
    .post((0, validateResource_1.validateResource)(volunteerSchema_1.createVolunteerSchema), volunteerController_1.createVolunteer);
// Get, update and delete volunteer by ID
router
    .route('/:id')
    .get(volunteerController_1.getVolunteerById)
    .put((0, validateResource_1.validateResource)(volunteerSchema_1.updateVolunteerSchema), volunteerController_1.updateVolunteer)
    .delete(volunteerController_1.deleteVolunteer);
// Update volunteer hours
router.patch('/:id/hours', (0, validateResource_1.validateResource)(volunteerSchema_1.updateVolunteerHoursSchema), volunteerController_1.updateVolunteerHours);
exports.default = router;
