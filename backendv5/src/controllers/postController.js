import { Post } from "../models/Post.js";
import { Community } from "../models/Community.js";

/**
 * Create Post Controller
 * Creates a new post in a community
 */
export const createPost = async (req, res) => {
  try {
    console.log("[Controller] Entering CreatePost Controller");
    console.log("[Controller] User ID:", req.user._id);
    console.log("[Controller] Request body:", { ...req.body, content: req.body.content?.substring(0, 50) + "..." });
    console.log("[Controller] File:", req.file ? "File present" : "No file");

    const { communityId, content } = req.body;
    let imageUrl = req.body.imageUrl; // fallback for URLs if they still use it

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Validation
    if (!communityId || !content) {
      console.log("[Controller] Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please provide communityId and content.",
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
        message: "You must be a member of this community to create posts.",
      });
    }

    // Create post
    console.log("[Controller] Creating new post in database");
    const post = new Post({
      author: req.user._id,
      community: communityId,
      content,
      imageUrl: imageUrl || undefined,
      likes: [],
    });

    await post.save();
    console.log("[Controller] Post created successfully. Post ID:", post._id);

    // Populate author and community details
    await post.populate("author", "name email");
    await post.populate("community", "name cityOrVillage");

    res.status(201).json({
      success: true,
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    console.error("[Controller] CreatePost error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating post. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Posts Controller
 * Fetches posts for a specific community
 */
export const getPosts = async (req, res) => {
  try {
    console.log("[Controller] Entering GetPosts Controller");
    console.log("[Controller] User ID:", req.user?._id);
    console.log("[Controller] Query parameters:", req.query);

    const { communityId } = req.query;

    if (!communityId) {
      console.log("[Controller] Validation failed: Missing communityId");
      return res.status(400).json({
        success: false,
        message: "Please provide communityId as query parameter.",
      });
    }
    
    // Verify community exists
    const community = await Community.findById(communityId);
    
    if (!community) {
      console.log("[Controller] Community not found with ID:", communityId);
      return res.status(404).json({
        success: false,
        message: "Community not found.",
      });
    }

    // Check if user is a member (if authenticated)
    if (req.user) {
      const isMember = req.user.joinedCommunities.some(
        (commId) => commId.toString() === communityId.toString()
      );

      if (!isMember) {
        console.log("[Controller] User is not a member of this community");
        return res.status(403).json({
          success: false,
          message: "You must be a member of this community to view posts.",
        });
      }
    }

    console.log("[Controller] Fetching posts for community:", communityId);
    const posts = await Post.find({ community: communityId })
      .populate("author", "name email hometown")
      .populate("community", "name cityOrVillage")
      .populate("likes", "name")
      .sort({ createdAt: -1 });

    console.log("[Controller] Found", posts.length, "posts");

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("[Controller] GetPosts error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching posts. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Like Post Controller
 * Toggles like on a post
 */
export const likePost = async (req, res) => {
  try {
    console.log("[Controller] Entering LikePost Controller");
    console.log("[Controller] User ID:", req.user._id);
    console.log("[Controller] Post ID:", req.params.id);

    const postId = req.params.id;
    const userId = req.user._id;

    // Find post
    const post = await Post.findById(postId);
    
    if (!post) {
      console.log("[Controller] Post not found with ID:", postId);
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Check if user already liked the post
    const isLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    if (isLiked) {
      // Unlike: remove user from likes array
      console.log("[Controller] User already liked post. Removing like");
      post.likes = post.likes.filter(
        (likeId) => likeId.toString() !== userId.toString()
      );
      await post.save();
      console.log("[Controller] Post unliked successfully");

      res.status(200).json({
        success: true,
        message: "Post unliked successfully.",
        likesCount: post.likes.length,
        isLiked: false,
      });
    } else {
      // Like: add user to likes array
      console.log("[Controller] Adding like to post");
      post.likes.push(userId);
      await post.save();
      console.log("[Controller] Post liked successfully. Total likes:", post.likes.length);

      res.status(200).json({
        success: true,
        message: "Post liked successfully.",
        likesCount: post.likes.length,
        isLiked: true,
      });
    }
  } catch (error) {
    console.error("[Controller] LikePost error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error liking post. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Comment on Post Controller
 * Adds a comment to a post (stored as a nested document or separate collection)
 * Note: This is a basic implementation. You may want to create a separate Comment model.
 */
export const commentOnPost = async (req, res) => {
  try {
    console.log("[Controller] Entering CommentOnPost Controller");
    console.log("[Controller] User ID:", req.user._id);
    console.log("[Controller] Post ID:", req.params.id);
    console.log("[Controller] Comment:", req.body.comment?.substring(0, 50) + "...");

    const postId = req.params.id;
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      console.log("[Controller] Validation failed: Missing comment");
      return res.status(400).json({
        success: false,
        message: "Please provide a comment.",
      });
    }

    // Find post
    const post = await Post.findById(postId);
    
    if (!post) {
      console.log("[Controller] Post not found with ID:", postId);
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // For now, we'll add comments as a simple array in the Post model
    // You may want to create a separate Comment model for better structure
    if (!post.comments) {
      post.comments = [];
    }

    const newComment = {
      user: req.user._id,
      text: comment.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    console.log("[Controller] Comment added successfully. Total comments:", post.comments.length);

    // Populate comment user details
    await post.populate("comments.user", "name email");

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error("[Controller] CommentOnPost error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error adding comment. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
