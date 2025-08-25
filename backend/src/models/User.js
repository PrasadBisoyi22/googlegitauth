const { pool } = require('../config/database');
const crypto = require('crypto');

class User {
  constructor() {
    this.pool = pool;
  }

  // Find user by email
  async findByEmail(email) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT u.*, ua.authProvider, ua.providerId FROM users u LEFT JOIN user_auth ua ON u.id = ua.userId WHERE u.email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by provider ID and provider
  async findByProviderId(providerId, provider) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT u.*, ua.authProvider, ua.providerId FROM users u JOIN user_auth ua ON u.id = ua.userId WHERE ua.providerId = ? AND ua.authProvider = ?',
        [providerId, provider]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by provider: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      const [rows] = await this.pool.execute(
        'SELECT u.*, ua.authProvider, ua.providerId FROM users u LEFT JOIN user_auth ua ON u.id = ua.userId WHERE u.id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Find all users
  async findAll() {
    try {
      const [rows] = await this.pool.execute(
        'SELECT u.*, ua.authProvider, ua.providerId FROM users u LEFT JOIN user_auth ua ON u.id = ua.userId ORDER BY u.createdAt DESC'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  // Create or update user (for OAuth)
  async createOrUpdate(userData) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const { email, name, avatar, provider, providerId, username } = userData;
      
      // Check if user exists with this email
      const [existingUsers] = await connection.execute(
        'SELECT u.id FROM users u WHERE u.email = ?',
        [email]
      );

      let userId;

      if (existingUsers.length > 0) {
        // User exists, update
        userId = existingUsers[0].id;
        await connection.execute(
          'UPDATE users SET name = ?, avatar = ?, updatedAt = NOW() WHERE id = ?',
          [name, avatar || '', userId]
        );
      } else {
        // Create new user
        userId = crypto.randomUUID();
        let generatedUsername = username || 
                               (email ? email.split("@")[0] : null) || 
                               name.replace(/\s+/g, "").toLowerCase();
        
        // Ensure unique username
        const [existingUsernames] = await connection.execute(
          'SELECT username FROM users WHERE username LIKE ?',
          [`${generatedUsername}%`]
        );
        
        let counter = 1;
        let uniqueUsername = generatedUsername;
        while (existingUsernames.some(u => u.username === uniqueUsername)) {
          uniqueUsername = `${generatedUsername}${counter}`;
          counter++;
        }

        await connection.execute(
          'INSERT INTO users (id, name, username, email, avatar, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, name, uniqueUsername, email, avatar || '', 'user']
        );
      }

      // Handle user_auth
      const [existingAuth] = await connection.execute(
        'SELECT id FROM user_auth WHERE userId = ? AND authProvider = ?',
        [userId, provider]
      );

      if (existingAuth.length === 0) {
        await connection.execute(
          'INSERT INTO user_auth (userId, authProvider, providerId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
          [userId, provider, providerId]
        );
      }

      // Handle user_activity
      const [existingActivity] = await connection.execute(
        'SELECT id FROM user_activity WHERE userId = ?',
        [userId]
      );

      if (existingActivity.length === 0) {
        await connection.execute(
          'INSERT INTO user_activity (userId) VALUES (?)',
          [userId]
        );
      }

      await connection.commit();
      
      // Return the complete user data
      const [userRows] = await connection.execute(
        'SELECT u.*, ua.authProvider, ua.providerId FROM users u LEFT JOIN user_auth ua ON u.id = ua.userId WHERE u.id = ?',
        [userId]
      );
      
      return userRows[0];
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating/updating user: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update user
  async update(id, updateData) {
    const connection = await this.pool.getConnection();
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (key !== 'id') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) return null;
      
      values.push(id);
      
      const [result] = await connection.execute(
        `UPDATE users SET ${fields.join(', ')}, updatedAt = NOW() WHERE id = ?`,
        values
      );
      
      if (result.affectedRows === 0) return null;
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update user activity
  async updateActivity(userId, activityData) {
    const connection = await this.pool.getConnection();
    try {
      const { lastLogin, lastLoginIP, lastLoginDevice } = activityData;
      
      await connection.execute(
        `UPDATE user_activity SET lastLogin = ?, lastLoginIP = ?, lastLoginDevice = ? WHERE userId = ?`,
        [lastLogin || new Date(), lastLoginIP || null, lastLoginDevice || null, userId]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Error updating user activity: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete user
  async delete(id) {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Get user with all related data
  async getUserWithAllData(userId) {
    try {
      const [userRows] = await this.pool.execute(
        'SELECT u.*, ua.authProvider, ua.providerId, ua.isMFAEnabled, ua.failedLoginAttempts, ua.accountLockUntil, act.lastLogin, act.lastLoginIP, act.lastLoginDevice FROM users u LEFT JOIN user_auth ua ON u.id = ua.userId LEFT JOIN user_activity act ON u.id = act.userId WHERE u.id = ?',
        [userId]
      );
      
      return userRows[0] || null;
    } catch (error) {
      throw new Error(`Error getting user with all data: ${error.message}`);
    }
  }
}

module.exports = new User();
