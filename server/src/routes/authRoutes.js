const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { generateToken, authMiddleware } = require('../auth');

module.exports = function (dbPromise) {
  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const db = await dbPromise;
      const user = db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Your account is suspended. Contact support.' });
      }

      const plan = db.get('SELECT * FROM plans WHERE id = ?', [user.plan_id]);
      const token = generateToken(user);

      let daysRemaining = null;
      let isPlanExpired = false;
      if (user.plan_id !== 'free' && user.plan_expires_at) {
        const expDate = new Date(user.plan_expires_at);
        const diffMs = expDate.getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        if (diffMs <= 0) {
          isPlanExpired = true;
        }
      }

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan_id: user.plan_id,
          plan_expires_at: user.plan_expires_at || null,
          daysRemaining,
          isPlanExpired,
          plan: plan || { name: 'Free', price: 0 },
          device_name: user.device_name,
          avatar: user.avatar,
          status: user.status
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during login' });
    }
  });

  // Register
  router.post('/register', async (req, res) => {
    try {
      const { name, email, password, device_name } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const db = await dbPromise;
      const existing = db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existing) {
        return res.status(400).json({ error: 'Email is already registered' });
      }

      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);
      const userId = 'user-' + uuidv4().substring(0, 8);
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
      const now = new Date().toISOString();

      db.run(
        `INSERT INTO users (id, name, email, password_hash, role, plan_id, plan_expires_at, device_name, avatar, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, email.toLowerCase().trim(), password_hash, 'user', 'free', null, device_name || 'My Mobile Device', avatar, 'active', now]
      );

      const newUser = db.get('SELECT * FROM users WHERE id = ?', [userId]);
      const plan = db.get('SELECT * FROM plans WHERE id = ?', ['free']);
      const token = generateToken(newUser);

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          plan_id: newUser.plan_id,
          plan_expires_at: newUser.plan_expires_at || null,
          plan: plan || { name: 'Free', price: 0 },
          device_name: newUser.device_name,
          avatar: newUser.avatar,
          status: newUser.status
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during registration' });
    }
  });

  // Guest login
  router.post('/guest', async (req, res) => {
    try {
      const guestId = 'guest-' + uuidv4().substring(0, 8);
      const guestName = 'Guest ' + Math.floor(1000 + Math.random() * 9000);
      const guestUser = {
        id: guestId,
        name: guestName,
        email: `${guestId}@guest.local`,
        role: 'guest',
        plan_id: 'free',
        plan_expires_at: null,
        device_name: 'Guest Mobile Device',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
        status: 'active'
      };

      const token = generateToken(guestUser);
      res.json({
        message: 'Guest session created',
        token,
        user: guestUser
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error during guest login' });
    }
  });

  // Get current authenticated user
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      if (req.user.role === 'guest') {
        return res.json({
          user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: 'guest',
            plan_id: 'free',
            plan_expires_at: null,
            plan: { name: 'Free', max_storage: 10 * 1024 * 1024 * 1024, max_storage_label: '10 GB' },
            device_name: 'Guest Mobile Device',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${req.user.id}`,
            status: 'active',
            storageUsed: 0
          }
        });
      }

      const user = db.get('SELECT id, name, email, role, plan_id, plan_expires_at, device_name, avatar, status, created_at FROM users WHERE id = ?', [req.user.id]);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const plan = db.get('SELECT * FROM plans WHERE id = ?', [user.plan_id]);

      // Calculate days remaining on plan if not free
      let daysRemaining = null;
      let isPlanExpired = false;
      if (user.plan_id !== 'free' && user.plan_expires_at) {
        const expDate = new Date(user.plan_expires_at);
        const diffMs = expDate.getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        if (diffMs <= 0) {
          isPlanExpired = true;
        }
      }

      // Calculate cloud storage used
      const cloudUsage = db.get('SELECT SUM(size) as total_used FROM cloud_files WHERE user_id = ?', [user.id]);
      const storageUsed = (cloudUsage && cloudUsage.total_used) ? Number(cloudUsage.total_used) : 0;

      res.json({
        user: {
          ...user,
          daysRemaining,
          isPlanExpired,
          plan: plan || { name: 'Free', price: 0, max_storage: 10 * 1024 * 1024 * 1024 },
          storageUsed
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error getting user profile' });
    }
  });

  // Update profile
  router.put('/profile', authMiddleware, async (req, res) => {
    try {
      const { name, device_name, avatar } = req.body;
      const db = await dbPromise;

      if (req.user.role === 'guest') {
        return res.json({ message: 'Guest profile updated in memory' });
      }

      db.run(
        `UPDATE users SET name = COALESCE(?, name), device_name = COALESCE(?, device_name), avatar = COALESCE(?, avatar) WHERE id = ?`,
        [name || null, device_name || null, avatar || null, req.user.id]
      );

      const updated = db.get('SELECT id, name, email, role, plan_id, device_name, avatar, status FROM users WHERE id = ?', [req.user.id]);
      res.json({ message: 'Profile updated successfully', user: updated });
    } catch (err) {
      res.status(500).json({ error: 'Server error updating profile' });
    }
  });

  // Change password
  router.put('/password', authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Both current and new password are required' });
      }

      const db = await dbPromise;
      const user = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const salt = bcrypt.genSaltSync(10);
      const newHash = bcrypt.hashSync(newPassword, salt);
      db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);

      res.json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  // Delete account (Permanent account removal)
  router.delete('/account', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      if (req.user.role === 'admin') {
        return res.status(400).json({ error: 'Cannot delete primary admin account' });
      }

      db.run('DELETE FROM users WHERE id = ?', [req.user.id]);
      db.run('DELETE FROM cloud_files WHERE user_id = ?', [req.user.id]);
      db.run('DELETE FROM transfer_sessions WHERE sender_id = ? OR receiver_id = ?', [req.user.id, req.user.id]);

      res.json({ message: 'Account and associated data deleted permanently' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  return router;
};
