const express = require("express");
const passport = require("passport");
const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`
  }),
  AuthController.handleOAuthCallback
);

// GitHub OAuth Routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`
  }),
  AuthController.handleOAuthCallback
);

// Email/Password Authentication Routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Verify session (check if user has valid cookie)
router.get("/verify-session", AuthController.verifySession);

// Protected Routes
router.get("/me", authMiddleware, AuthController.getCurrentUser);
router.put("/profile", authMiddleware, AuthController.updateProfile);
router.post("/verify-token", AuthController.verifyToken);

// Admin Routes
router.get("/users", authMiddleware, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
}, AuthController.getAllUsers);

module.exports = router;
