import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import redisclient from "../config/redis.js";
/**
 * Register Controller
 * Creates a new user account
 */
export const register = async (req, res) => {
  try {
    console.log("[Controller] Entering Register Controller");
    console.log("[Controller] Request body:", { ...req.body, password: "***" });

    const { name, email, password, hometown, role } = req.body;

    // Validation
    if (!name || !email || !password || !hometown) {
      console.log("[Controller] Validation failed: Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and hometown.",
      });
    }

    // Check if user already exists
    console.log("[Controller] Checking if user exists with email:", email);
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log("[Controller] User already exists with email:", email);
      return res.status(409).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash password
    console.log("[Controller] Hashing password for user:", email);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    console.log("[Controller] Creating new user in database");
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      hometown,
      role: role || "User",
      joinedCommunities: [],
    });

    await user.save();
    console.log("[Controller] User created successfully. User ID:", user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in signed cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    console.log("[Controller] JWT token generated and set in cookie for User ID:", user._id);

    // Return user data (without password)
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hometown: user.hometown,
        role: user.role,
        joinedCommunities: user.joinedCommunities,
      },
    });
  } catch (error) {
    console.error("[Controller] Register error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error registering user. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Login Controller
 * Authenticates user and returns JWT token
 */
export const login = async (req, res) => {
  try {
    console.log("[Controller] Entering Login Controller");
    console.log("[Controller] Request body:", { email: req.body.email, password: "***" });

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("[Controller] Validation failed: Missing email or password");
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user
    console.log("[Controller] Finding user with email:", email);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log("[Controller] User not found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    console.log("[Controller] Verifying password for User ID:", user._id);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("[Controller] Invalid password for User ID:", user._id);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    console.log("[Controller] Password verified successfully for User ID:", user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set token in signed cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    console.log("[Controller] JWT token generated and set in cookie for User ID:", user._id);

    // Return user data (without password)
    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hometown: user.hometown,
        role: user.role,
        joinedCommunities: user.joinedCommunities,
      },
    });
  } catch (error) {
    console.error("[Controller] Login error:", error.message);
    console.error("[Controller] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Logout Controller
 * Clears the authentication cookie
 */
/**
 * Logout Controller
 * Clears the signed JWT cookie from the browser
 */
export const logout = async (req, res) => {
  try {
    // console.log(req.cookies);
    const { token } = req.signedCookies;
    // console.log(token);
    if (!token) {
      return res.status(401).send("Not authenticated");
    }
    // const payLoad=jwt.decode(token);
    const payLoad = jwt.verify(token, process.env.JWT_SECRET);
    await redisclient.set(`token:${token}`, "Blocked");
    await redisclient.expireAt(`token:${token}`, payLoad.exp);
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("[Controller] Logout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error logging out. Please try again.",
    });
  }
};

/**
 * Get Current User Profile
 * Returns data for the currently authenticated user
 */
export const getMe = async (req, res) => {
  try {
    // req.user is populated by your userMiddleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("[Controller] getMe error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile.",
    });
  }
};