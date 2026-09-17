import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  deleteEvent,
  cleanupPastEvents,
} from "../controllers/eventController.js";
import { userMiddleware, isCommunityMember } from "../middleware/auth.js";

const router = express.Router();

// Public routes (can be made protected if needed)
router.get("/", getEvents);
router.get("/:id", getEventById);

// Protected routes (require authentication)
router.post("/create", userMiddleware, createEvent);
router.post("/:id/join", userMiddleware, joinEvent);
router.delete("/cleanup-past", userMiddleware, cleanupPastEvents);
router.delete("/:id", userMiddleware, deleteEvent);

export default router;
