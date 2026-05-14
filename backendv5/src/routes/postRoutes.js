import express from "express";
import {
  createPost,
  getPosts,
  likePost,
  commentOnPost,
} from "../controllers/postController.js";
import { userMiddleware, isCommunityMember } from "../middleware/auth.js";
import { isApprovedMember } from "../middleware/communityGuard.js";
import { upload } from "../middleware/multer.js";
const router = express.Router();

// Protected routes (require authentication)
router.post("/", userMiddleware, upload.single("media"), createPost);
router.get("/get", userMiddleware, isApprovedMember, getPosts);
router.post("/:id/like", userMiddleware, likePost);
router.post("/:id/comment", userMiddleware, commentOnPost);

export default router;
