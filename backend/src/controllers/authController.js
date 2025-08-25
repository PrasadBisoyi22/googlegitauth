const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthController {
  // Handle successful OAuth authentication
  static handleOAuthCallback(req, res) {
    try {
      // Check for authentication failure (email conflict)
      if (!req.user && req.authInfo) {
        const errorMessage = req.authInfo.message || "Authentication failed";
        const provider = req.authInfo.provider || "unknown";
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}&provider=${provider}`);
      }

      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }

      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email,
          role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to login page with token and user data
      res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        username: req.user.username,
        role: req.user.role,
        authProvider: req.user.authProvider
      }))}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  }

  // Get current user profile
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const user = User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          username: user.username,
          role: user.role,
          authProvider: user.authProvider,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all users (admin only)
  static async getAllUsers(req, res) {
    try {
      const users = User.findAll();
      
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        username: user.username,
        role: user.role,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }));

      res.json({
        success: true,
        users: sanitizedUsers
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, avatar } = req.body;

      const updateData = {
        name: name || undefined,
        avatar: avatar || undefined
      };

      const updatedUser = User.update(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          username: updatedUser.username,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Verify JWT token
  static verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Verify token error:", error);
      res.status(401).json({ error: "Invalid token" });
    }
  }
}

module.exports = AuthController;
