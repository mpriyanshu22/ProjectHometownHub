import { Event } from "../models/Event.js";
import { Community } from "../models/Community.js";

/**
 * Create Event Controller
 * Creates a new event in a community
 */
export const createEvent = async (req, res) => {
  try {
    console.log("[Controller] Entering CreateEvent Controller");
    console.log("[Controller] User ID:", req.user._id);
    console.log("[Controller] Request body:", req.body);

    const { title, description, communityId, eventDate, location } = req.body;

    // Validation
    if (!title || !communityId || !eventDate) {
      console.log("[Controller] Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please provide title, communityId, and eventDate.",
      });
    }

    // Verify community exists and user is a member
    const community = await Community.findById(communityId);
    
    if (!community) {
      console.log("[Controller] Community not found with ID:", communityId);
      return res.status(404).json({
        success: false,
        message: "Community not found.",
      });
    }

    // Check if user is a member
    const isMember = req.user.joinedCommunities.some(
      (commId) => commId.toString() === communityId.toString()
    );

    if (!isMember) {
      console.log("[Controller] User is not a member of this community");
      return res.status(403).json({
        success: false,
        message: "You must be a member of this community to create events.",
      });
    }

    // Validate event date
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {
      console.log("[Controller] Invalid event date format");
      return res.status(400).json({
        success: false,
        message: "Please provide a valid event date.",
      });
    }

    // Create event
    console.log("[Controller] Creating new event in database");
    const event = new Event({
      title,
      description: description || "",
      community: communityId,
      organizer: req.user._id,
      eventDate: eventDateObj,
      location: location || "",
      attendees: [],
      status: "Upcoming",
    });

    await event.save();
    console.log("[Controller] Event created successfully. Event ID:", event._id);

    // Populate organizer and community details
    await event.populate("organizer", "name email");
    await event.populate("community", "name cityOrVillage");

    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    console.error("[Controller] CreateEvent error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating event. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Events Controller
 * Fetches events for a specific community or all events
 */
export const getEvents = async (req, res) => {
  try {
    console.log("[Controller] Entering GetEvents Controller");
    console.log("[Controller] User ID:", req.user?._id);
    console.log("[Controller] Query parameters:", req.query);

    const { communityId, status } = req.query;

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
      console.log("[Controller] Filtering events by community:", communityId);
    }

    if (status) {
      query.status = status;
      console.log("[Controller] Filtering events by status:", status);
    }

    console.log("[Controller] Fetching events with query:", query);
    const events = await Event.find(query)
      .populate("organizer", "name email")
      .populate("community", "name cityOrVillage")
      .populate("attendees", "name email")
      .sort({ eventDate: 1 }); // Sort by event date ascending

    console.log("[Controller] Found", events.length, "events");

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("[Controller] GetEvents error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching events. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Single Event Controller
 * Gets details of a specific event
 */
export const getEventById = async (req, res) => {
  try {
    console.log("[Controller] Entering GetEventById Controller");
    console.log("[Controller] Event ID:", req.params.id);

    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("community", "name cityOrVillage")
      .populate("attendees", "name email");

    if (!event) {
      console.log("[Controller] Event not found with ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    console.log("[Controller] Event found:", event.title);

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("[Controller] GetEventById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching event. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Join Event Controller
 * Adds user to event attendees list
 */
export const joinEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;
    const userJoinedCommunities = req.user.joinedCommunities; // Array of ObjectIds from auth middleware

    /**
     * ONE DB HIT:
     * Filter 1: The Event ID matches.
     * Filter 2: The User is NOT already in the attendees array ($ne).
     * Filter 3: The Event's community is in the User's joinedCommunities list ($in).
     */
    const event = await Event.findOneAndUpdate(
      { 
        _id: eventId, 
        attendees: { $ne: userId },
        community: { $in: userJoinedCommunities } 
      },
      { 
        $addToSet: { attendees: userId } 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate("attendees", "name email");

    // If 'event' is null, the update failed. We need to tell the user WHY.
    if (!event) {
      const existingEvent = await Event.findById(eventId);
      
      if (!existingEvent) {
        return res.status(404).json({ success: false, message: "Event not found." });
      }

      // Check if the failure was due to membership
      const isMember = userJoinedCommunities.some(
        (id) => id.toString() === existingEvent.community.toString()
      );

      if (!isMember) {
        return res.status(403).json({ 
          success: false, 
          message: "Forbidden: You are not a member of this community." 
        });
      }

      return res.status(409).json({
        success: false,
        message: "You are already registered for this event.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully joined the event.",
      event: {
        id: event._id,
        attendeesCount: event.attendees.length,
        attendees: event.attendees,
      },
    });

  } catch (error) {
    console.error("[Controller] JoinEvent Error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};