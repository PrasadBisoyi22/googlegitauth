const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

      // Set token as HTTP-only cookie
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to dashboard without exposing token in URL
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
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

  // Register new user with email/password
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user data
      const userData = {
        name,
        email,
        username: email.split('@')[0],
        provider: 'email',
        passwordHash
      };

      // Create user
      const user = await User.createOrUpdate(userData);

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set token as HTTP-only cookie
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          username: user.username,
          role: user.role,
          authProvider: user.authProvider
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Login with email/password
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Check if user has password authentication
      if (!user.passwordHash) {
        return res.status(401).json({ 
          error: "Please use your OAuth provider to login",
          provider: user.authProvider
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set token as HTTP-only cookie
      res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          username: user.username,
          role: user.role,
          authProvider: user.authProvider
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Verify session (check HTTP-only cookie)
  static async verifySession(req, res) {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        return res.json({ authenticated: false });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.json({ authenticated: false });
      }

      res.json({
        authenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          authProvider: user.authProvider
        }
      });
    } catch (error) {
      console.error("Verify session error:", error);
      res.json({ authenticated: false });
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
