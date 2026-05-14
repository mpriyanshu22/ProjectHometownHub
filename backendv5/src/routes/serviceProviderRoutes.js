import express from "express";
import {
  createServiceProvider,
  getServiceProviders,
  getServiceProviderById,
  updateServiceProviderStatus,
  getServiceProvidersByCommunity,
  getPendingServiceProviders,
} from "../controllers/serviceProviderController.js";
import { userMiddleware, isCommunityMember } from "../middleware/auth.js";
import { isAdminOrModerator } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes (can view approved service providers)
router.get("/query", getServiceProviders);
router.get("/pending", getPendingServiceProviders);
router.get("/:id", getServiceProviderById);
router.get("/community/:communityId", getServiceProvidersByCommunity);
// Protected routes (require authentication)
router.post("/create", userMiddleware, createServiceProvider);

// Admin/Moderator only routes
router.patch("/:id/status", userMiddleware, isAdminOrModerator, updateServiceProviderStatus);

export default router;
