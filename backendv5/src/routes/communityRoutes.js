import express from "express";
import {
  createCommunity,
  getCommunities,
  getCommunityById,
  joinCommunity,
  updateCommunityStatus,
    getPendingCommunities // Added
} from "../controllers/communityController.js";
import { userMiddleware, isCommunityMember } from "../middleware/auth.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
const CommunityRouter = express.Router();

// Public routes
CommunityRouter.get("/", getCommunities);
CommunityRouter.get("/:id", getCommunityById);
// Dashboard: View all pending requests
CommunityRouter.get("/admin/pending", userMiddleware, isAdmin, getPendingCommunities);
// Protected routes (require authentication)
console.log("Community Routes Loaded");
CommunityRouter.post("/create", userMiddleware, createCommunity);
CommunityRouter.post("/:id/join", userMiddleware, joinCommunity);
// Protected Admin Route
CommunityRouter.patch("/:id/status", userMiddleware,isAdmin, updateCommunityStatus);
export default CommunityRouter;

