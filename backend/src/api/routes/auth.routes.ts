import { Router } from "express";
import { registerUser, loginUser, getCurrentUser } from "../../controller/auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadSingleFile } from "../../middlewares/upload.middleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { loginSchema, registerSchema } from "../../validation/auth.schema";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  uploadSingleFile,
  validateRequest(registerSchema),
  registerUser
);

// POST /api/auth/login
router.post(
  "/login",
  validateRequest(loginSchema),
  loginUser
);

// GET /api/auth/me - get current logged in user info (protected)
router.get("/me", authenticate, getCurrentUser);

export default router;
