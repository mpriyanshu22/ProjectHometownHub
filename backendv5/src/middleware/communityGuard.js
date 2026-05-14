import { Community } from "../models/Community.js";

export const isApprovedMember = async (req, res, next) => {
  const { communityId } = req.query || req.params || req.body;

  // 1. Check if user is a member (already in req.user from authMiddleware)
  const isMember = req.user.joinedCommunities.some(id => id.toString() === communityId);
  
  if (!isMember) {
    return res.status(403).json({ success: false, message: "Not a member." });
  }

  // 2. The 'Safety Check': Is the community still active/approved?
  const community = await Community.findOne({ _id: communityId, status: "Approved" });
  if (!community) {
    return res.status(404).json({ success: false, message: "Community is inactive." });
  }

  next();
};