"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../../controller/auth.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_schema_1 = require("../../validation/auth.schema");
const router = (0, express_1.Router)();
// POST /api/auth/register
router.post("/register", upload_middleware_1.uploadSingleFile, (0, validateRequest_1.validateRequest)(auth_schema_1.registerSchema), auth_controller_1.registerUser);
// POST /api/auth/login
router.post("/login", (0, validateRequest_1.validateRequest)(auth_schema_1.loginSchema), auth_controller_1.loginUser);
// GET /api/auth/me - get current logged in user info (protected)
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.getCurrentUser);
exports.default = router;
