import express from "express";
import {
  register,
  login,
  logout,
  getMe
} from "../controllers/authController.js";
import { userMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", logout);
// Frontend session persistence endpoint
router.get("/me", userMiddleware, getMe);
// Backwards-compat alias
router.get("/getMe", userMiddleware, getMe); // Added: Essential for Frontend Persistence
export default router;
