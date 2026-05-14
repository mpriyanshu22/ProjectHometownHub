import { Community } from "../models/Community.js";
import { User } from "../models/User.js";

/**
 * Create Community Controller
 * Creates a new community request (defaults to 'Pending' status)
 */
export const createCommunity = async (req, res) => {
  try {
    console.log("[Controller] Entering CreateCommunity Controller");
    console.log("[Controller] User ID:", req.user._id);
    console.log("[Controller] Request body:", req.body);

    const { name, cityOrVillage, description } = req.body;

    // Validation
    if (!name || !cityOrVillage) {
      console.log("[Controller] Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please provide name and city/village.",
      });
    }

    // Create community
    console.log("[Controller] Creating new community in database");
    const community = new Community({
      name,
      cityOrVillage,
      description: description || "",
      creator: req.user._id,
      memberCount: 0,
      status: "Pending",
    });

    await community.save();
    console.log("[Controller] Community created successfully. Community ID:", community._id);

    // Populate creator details
    await community.populate("creator", "name email");

    res.status(201).json({
      success: true,
      message: "Community request created successfully. Waiting for approval.",
      community,
    });
  } catch (error) {
    console.error("[Controller] CreateCommunity error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating community. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Communities Controller
 * Lists all approved communities with optional city/village filter
 */
export const getCommunities = async (req, res) => {
  try {
    console.log("[Controller] Entering GetCommunities Controller");
    console.log("[Controller] Query parameters:", req.query);

    const { cityOrVillage, status } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    } else {
      // Default to approved communities only
      query.status = "Approved";
    }

    if (cityOrVillage) {
      query.cityOrVillage = { $regex: cityOrVillage, $options: "i" };
      console.log("[Controller] Filtering by city/village:", cityOrVillage);
    }

    console.log("[Controller] Fetching communities with query:", query);
    const communities = await Community.find(query)
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    console.log("[Controller] Found", communities.length, "communities");

    res.status(200).json({
      success: true,
      count: communities.length,
      communities,
    });
  } catch (error) {
    console.error("[Controller] GetCommunities error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching communities. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Single Community Controller
 * Gets details of a specific community
 */
export const getCommunityById = async (req, res) => {
  try {
    console.log("[Controller] Entering GetCommunityById Controller");
    console.log("[Controller] Community ID:", req.params.id);

    const community = await Community.findById(req.params.id)
      .populate("creator", "name email");

    if (!community) {
      console.log("[Controller] Community not found with ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Community not found.",
      });
    }

    console.log("[Controller] Community found:", community.name);

    res.status(200).json({
      success: true,
      community,
    });
  } catch (error) {
    console.error("[Controller] GetCommunityById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching community. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Join Community Controller
 * Adds the community to user's joinedCommunities array
 */
export const joinCommunity = async (req, res) => {
  try {
    const communityId = req.params.id;
    const userId = req.user._id;

    // 1. Check if community exists and is approved
    const community = await Community.findOne({ _id: communityId, status: "Approved" });
    if (!community) {
      return res.status(404).json({ success: false, message: "Approved community not found." });
    }

    // 2. Update User (Atomic $addToSet prevents duplicates)
    const user = await User.findOneAndUpdate(
      { _id: userId, joinedCommunities: { $ne: communityId } }, // Only update if NOT already in array
      { $push: { joinedCommunities: communityId } },
      { new: true }
    );

    if (!user) {
      return res.status(409).json({ success: false, message: "Already a member." });
    }

    // 3. Update Community Count (Atomic increment)
    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
      { $inc: { memberCount: 1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Successfully joined!",
      community: { id: updatedCommunity._id, memberCount: updatedCommunity.memberCount },
    });
  } catch (error) {
    console.error("[Controller] JoinCommunity error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error joining community. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update Community Status (Admin Only)
 * Approves or Rejects a community request
 */
export const updateCommunityStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expecting "Approved" or "Rejected"
    const { id } = req.params;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const community = await Community.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ success: false, message: "Community not found." });
    }

    res.status(200).json({
      success: true,
      message: `Community status updated to ${status}`,
      community
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Pending Communities (Admin Only)
 * Lists all communities awaiting approval for the Admin Dashboard
 */
export const getPendingCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ status: "Pending" })
      .populate("creator", "name email")
      .sort({ createdAt: 1 }); // Oldest first (FIFO queue)

    res.status(200).json({
      success: true,
      count: communities.length,
      communities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending communities.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};