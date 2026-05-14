import mongoose from "mongoose";
import { ServiceProvider } from "../models/ServiceProvider.js";
import { Community } from "../models/Community.js";

/**
 * Create Service Provider Controller
 * Registers a new service provider for a community (defaults to 'Pending' status)
 */
export const createServiceProvider = async (req, res) => {
  try {
    const { name, specialization, communityId, number, email } = req.body;
    const userId = req.user._id;

    // 1. Basic Validation
    if (!name || !communityId) {
      return res.status(400).json({ success: false, message: "Missing name or communityId." });
    }

    // 2. Strict Membership Check (using req.user from auth middleware)
    const isMember = req.user.joinedCommunities.some(id => id.toString() === communityId);
    if (!isMember) {
      return res.status(403).json({ success: false, message: "Must be a community member." });
    }

    // 3. Create (Linked to Owner)
    const serviceProvider = await ServiceProvider.create({
      name: name.trim(),
      specialization: Array.isArray(specialization) ? specialization : [],
      community: communityId,
      number: number?.trim(),
      email: email?.trim(),
      owner: userId, // Link to the logged-in user
      onboardingStatus: "Pending",
    });

    await serviceProvider.populate("community", "name cityOrVillage");

    res.status(201).json({
      success: true,
      message: "Registration submitted for approval.",
      serviceProvider,
    });
  } catch (error) {
    // Handle Duplicate Key error if you add a unique index on (owner + community)
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Service Providers Controller
 * Fetches service providers with optional filters (community, status)
 */
export const getServiceProviders = async (req, res) => {
  try {
    console.log("[Controller] Entering GetServiceProviders Controller");
    console.log("[Controller] User ID:", req.user?._id);
    console.log("[Controller] Query parameters:", req.query);

    const { communityId, status, specialization } = req.query;

    // Build query
    const query = {};

    if (communityId) {
      // Verify community exists
      const community = await Community.findById(communityId);
      
      if (!community) {
        console.log("[Controller] Community not found with ID:", communityId);
        return res.status(404).json({
          success: false,
          message: "Community not found.",
        });
      }

      query.community = communityId;
      console.log("[Controller] Filtering by community:", communityId);
    }

    if (status) {
      query.onboardingStatus = status;
      console.log("[Controller] Filtering by status:", status);
    } else {
      // Default to approved service providers only
      query.onboardingStatus = "Approved";
    }

    if (specialization) {
      query.specialization = { $in: [specialization] };
      console.log("[Controller] Filtering by specialization:", specialization);
    }

    console.log("[Controller] Fetching service providers with query:", query);
    const serviceProviders = await ServiceProvider.find(query)
      .populate("community", "name cityOrVillage")
      .sort({ createdAt: -1 });

    console.log("[Controller] Found", serviceProviders.length, "service providers");

    res.status(200).json({
      success: true,
      count: serviceProviders.length,
      serviceProviders,
    });
  } catch (error) {
    console.error("[Controller] GetServiceProviders error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching service providers. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Single Service Provider Controller
 * Gets details of a specific service provider
 */
export const getServiceProviderById = async (req, res) => {
  try {
    console.log("[Controller] Entering GetServiceProviderById Controller");
    console.log("[Controller] Service Provider ID:", req.params.id);

    const serviceProvider = await ServiceProvider.findById(req.params.id)
      .populate("community", "name cityOrVillage description");

    if (!serviceProvider) {
      console.log("[Controller] Service provider not found with ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Service provider not found.",
      });
    }

    console.log("[Controller] Service provider found:", serviceProvider.name);

    res.status(200).json({
      success: true,
      serviceProvider,
    });
  } catch (error) {
    console.error("[Controller] GetServiceProviderById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching service provider. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update Service Provider Status Controller
 * Updates the onboarding status (Admin/Moderator only)
 */
export const updateServiceProviderStatus = async (req, res) => {
  try {
    console.log("[Controller] Entering UpdateServiceProviderStatus Controller");
    console.log("[Controller] User ID:", req.user._id);
    console.log("[Controller] User Role:", req.user.role);
    console.log("[Controller] Service Provider ID:", req.params.id);
    console.log("[Controller] Request body:", req.body);

    const { status } = req.body;

    // Validation
    if (!status || !["Pending", "Approved"].includes(status)) {
      console.log("[Controller] Validation failed: Invalid status");
      return res.status(400).json({
        success: false,
        message: "Please provide a valid status (Pending or Approved).",
      });
    }

    // Find service provider
    const serviceProvider = await ServiceProvider.findById(req.params.id);
    
    if (!serviceProvider) {
      console.log("[Controller] Service provider not found with ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Service provider not found.",
      });
    }

    // Update status
    console.log("[Controller] Updating service provider status from", serviceProvider.onboardingStatus, "to", status);
    serviceProvider.onboardingStatus = status;
    await serviceProvider.save();

    console.log("[Controller] Service provider status updated successfully");

    // Populate community details
    await serviceProvider.populate("community", "name cityOrVillage");

    res.status(200).json({
      success: true,
      message: `Service provider status updated to ${status}.`,
      serviceProvider,
    });
  } catch (error) {
    console.error("[Controller] UpdateServiceProviderStatus error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error updating service provider status. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Service Providers by Community Controller
 * Fetches all service providers for a specific community
 */
export const getServiceProvidersByCommunity = async (req, res) => {
  try {
    console.log("[Controller] Entering GetServiceProvidersByCommunity Controller");
    console.log("[Controller] Community ID:", req.params.communityId);

    const { status } = req.query;
    const communityId = req.params.communityId;

    // Verify community exists
    const community = await Community.findById(communityId);
    
    if (!community) {
      console.log("[Controller] Community not found with ID:", communityId);
      return res.status(404).json({
        success: false,
        message: "Community not found.",
      });
    }

    // Build query
    const query = { community: communityId };
    
    if (status) {
      query.onboardingStatus = status;
    } else {
      // Default to approved only
      query.onboardingStatus = "Approved";
    }

    console.log("[Controller] Fetching service providers for community:", communityId);
    const serviceProviders = await ServiceProvider.find(query)
      .populate("community", "name cityOrVillage")
      .sort({ createdAt: -1 });

    console.log("[Controller] Found", serviceProviders.length, "service providers for community");

    res.status(200).json({
      success: true,
      count: serviceProviders.length,
      community: {
        id: community._id,
        name: community.name,
        cityOrVillage: community.cityOrVillage,
      },
      serviceProviders,
    });
  } catch (error) {
    console.error("[Controller] GetServiceProvidersByCommunity error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching service providers. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getPendingServiceProviders = async (req, res) => {
  try {
    // We only care about pending ones for the admin review
    const query = { onboardingStatus: "Pending" };
    const pendingProviders = await ServiceProvider.find(query)
      .populate("community", "name cityOrVillage")
      .sort({ createdAt: 1 }); // Oldest first so they don't wait long!
    
    res.status(200).json({
      success: true,
      count: pendingProviders.length,
      serviceProviders: pendingProviders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



