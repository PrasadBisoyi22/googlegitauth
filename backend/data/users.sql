-- ==============================
-- USERS (Core Profile)
-- ==============================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar VARCHAR(500),
  gender ENUM('Male', 'Female', 'Other'),
  role ENUM('admin', 'user') DEFAULT 'user',
  phoneNumber VARCHAR(20),
  college VARCHAR(100),
  year INT,
  address VARCHAR(500),
  dateOfBirth DATE,
  createdBy CHAR(36),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================
-- AUTHENTICATION (email, google, github, linkedin, etc.)
-- ==============================
CREATE TABLE IF NOT EXISTS user_auth (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  authProvider ENUM('email', 'google', 'github') NOT NULL,
  providerId VARCHAR(255),
  passwordHash VARCHAR(255), -- only for email logins
  isMFAEnabled BOOLEAN DEFAULT FALSE,
  failedLoginAttempts INT DEFAULT 0,
  accountLockUntil DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (userId, authProvider),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================
-- SECURITY (password reset, OTPs, etc.)
-- ==============================
CREATE TABLE IF NOT EXISTS user_security (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  resetOTP VARCHAR(10),
  resetOTPExpires DATETIME,
  resetPasswordToken TEXT,
  resetPasswordExpires DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================
-- USER ACTIVITY (last login, device, IP, etc.)
-- ==============================
CREATE TABLE IF NOT EXISTS user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  lastLogin DATETIME,
  lastLoginIP VARCHAR(100),
  lastLoginDevice VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
