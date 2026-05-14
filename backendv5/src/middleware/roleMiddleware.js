/**
 * Role-based Authorization Middleware
 * Checks if the user has the required role (Admin or Moderator)
 */

/**
 * Admin Only Middleware
 * Only allows Admin users to proceed
 */
export const isAdmin = (req, res, next) => {
  try {
    console.log("[Middleware] Entering isAdmin guard");
    
    if (!req.user) {
      console.log("[Middleware] No user found in request. userMiddleware must be called first.");
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    console.log("[Middleware] Checking admin access for User:", req.user._id, "Role:", req.user.role);

    if (req.user.role !== "Admin") {
      console.log("[Middleware] Access denied. User is not an Admin");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    console.log("[Middleware] Admin access granted. Proceeding...");
    next();
  } catch (error) {
    console.error("[Middleware] isAdmin error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error checking admin access.",
    });
  }
};

/**
 * Admin or Moderator Middleware
 * Allows Admin or Moderator users to proceed
 */
export const isAdminOrModerator = (req, res, next) => {
  try {
    console.log("[Middleware] Entering isAdminOrModerator guard");
    
    if (!req.user) {
      console.log("[Middleware] No user found in request. userMiddleware must be called first.");
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    console.log("[Middleware] Checking admin/moderator access for User:", req.user._id, "Role:", req.user.role);

    if (req.user.role !== "Admin" && req.user.role !== "Moderator") {
      console.log("[Middleware] Access denied. User is not an Admin or Moderator");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Moderator privileges required.",
      });
    }

    console.log("[Middleware] Admin/Moderator access granted. Proceeding...");
    next();
  } catch (error) {
    console.error("[Middleware] isAdminOrModerator error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error checking access privileges.",
    });
  }
};
