import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Authentication Middleware
 * Extracts JWT from cookies, verifies it, and attaches user to req.user
 */
export const userMiddleware = async (req, res, next) => {
  try {
    console.log("[Middleware] Entering userMiddleware");
    console.log("[Middleware] Request cookies:", req.signedCookies);

    // Extract token from signed cookies
    const token = req.signedCookies?.token;

    if (!token) {
      console.log("[Middleware] No token found in cookies");
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Verify token using JWT_SECRET from environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[Middleware] Token decoded successfully. User ID:", decoded.userId);

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      console.log("[Middleware] User not found for ID:", decoded.userId);
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // Attach user to request object
    req.user = user;
    console.log("[Middleware] User attached to request. User ID:", user._id, "Email:", user.email);
    next();
  } catch (error) {
    console.error("[Middleware] Authentication error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error. Please try again.",
    });
  }
};

/**
 * Community Member Guard
 * Checks if the user is a member of the specified community
 */
export const isCommunityMember = async (req, res, next) => {
  try {
    console.log("[Middleware] Entering isCommunityMember guard");
    
    if (!req.user) {
      console.log("[Middleware] No user found in request. userMiddleware must be called first.");
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Get communityId from params or body
    const communityId = req.params.id || req.params.communityId || req.body.communityId || req.body.community;
    
    if (!communityId) {
      console.log("[Middleware] No communityId found in request");
      return res.status(400).json({
        success: false,
        message: "Community ID is required.",
      });
    }

    console.log("[Middleware] Checking membership for User:", req.user._id, "Community:", communityId);
    console.log("[Middleware] User's joined communities:", req.user.joinedCommunities);

    // Check if communityId exists in user's joinedCommunities array
    const isMember = req.user.joinedCommunities.some(
      (commId) => commId.toString() === communityId.toString()
    );

    if (!isMember) {
      console.log("[Middleware] User is NOT a member of this community");
      return res.status(403).json({
        success: false,
        message: "Access denied. You must be a member of this community to perform this action.",
      });
    }

    console.log("[Middleware] User is a member of the community. Proceeding...");
    req.communityId = communityId;
    next();
  } catch (error) {
    console.error("[Middleware] isCommunityMember error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error checking community membership.",
    });
  }
};
