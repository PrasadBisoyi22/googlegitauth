const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Send reset password email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found. Check your email address." });
    }

    // Check if user has email authentication
    if (!user.passwordHash) {
      return res.status(400).json({
        error: "This account uses OAuth login. Please use your OAuth provider to login.",
        provider: user.authProvider
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("Transporter verification failed:", verifyError.message);
      return res.status(500).json({ error: "Email service configuration error" });
    }

    // Send email
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password.</p>
        <p><a href="${resetLink}" target="_blank">Click here to reset your password</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'Reset link sent successfully to your email.' });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Something went wrong. Try again later." });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in user_auth table
    const { pool } = require('../config/database');
    await pool.execute(
      'UPDATE user_auth SET passwordHash = ?, updatedAt = NOW() WHERE userId = ?',
      [passwordHash, decoded.id]
    );

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
