const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../auth');

module.exports = function (dbPromise) {
  // Get all plans
  router.get('/', async (req, res) => {
    try {
      const db = await dbPromise;
      const plans = db.all('SELECT * FROM plans ORDER BY price ASC');
      const parsed = plans.map(p => ({
        ...p,
        features: JSON.parse(p.features || '[]')
      }));
      res.json({ plans: parsed });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve plans' });
    }
  });

  // Simulated Checkout & Payment
  router.post('/checkout', authMiddleware, async (req, res) => {
    try {
      const { plan_id, method, duration_months } = req.body;
      if (!plan_id || !method) {
        return res.status(400).json({ error: 'plan_id and method are required' });
      }

      const db = await dbPromise;
      const plan = db.get('SELECT * FROM plans WHERE id = ?', [plan_id]);
      if (!plan) {
        return res.status(404).json({ error: 'Selected plan not found' });
      }

      const user = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const txId = 'tx-' + uuidv4().substring(0, 8);
      const now = new Date();
      const months = Number(duration_months) || 1;

      // Calculate expiration date
      let baseDate = now;
      if (user.plan_expires_at && user.plan_id === plan.id) {
        const existingExp = new Date(user.plan_expires_at);
        if (existingExp > now) {
          baseDate = existingExp;
        }
      }
      const expiresAtDate = new Date(baseDate.getTime() + months * 30 * 86400000);
      const expires_at = plan.id === 'free' ? null : expiresAtDate.toISOString();

      // Create transaction
      db.run(
        `INSERT INTO transactions (id, user_id, user_name, user_email, plan_id, amount, method, status, duration_months, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [txId, user.id, user.name, user.email, plan.id, plan.price * months, method, 'success', months, expires_at, now.toISOString()]
      );

      // Immediately upgrade user plan and set plan_expires_at
      db.run('UPDATE users SET plan_id = ?, plan_expires_at = ? WHERE id = ?', [plan.id, expires_at, user.id]);

      const updatedUser = db.get('SELECT id, name, email, role, plan_id, plan_expires_at, device_name, avatar, status FROM users WHERE id = ?', [user.id]);

      res.json({
        message: `Successfully upgraded to ${plan.name} plan!`,
        transaction: {
          id: txId,
          plan: plan.name,
          plan_id: plan.id,
          amount: plan.price * months,
          method,
          status: 'success',
          duration_months: months,
          expires_at,
          created_at: now.toISOString()
        },
        user: {
          ...updatedUser,
          daysRemaining: months * 30,
          isPlanExpired: false,
          plan: {
            ...plan,
            features: JSON.parse(plan.features || '[]')
          }
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Payment simulation failed' });
    }
  });

  // User: Get personal plan transaction history & subscription expiry
  router.get('/my-transactions', authMiddleware, async (req, res) => {
    try {
      const db = await dbPromise;
      const user = db.get('SELECT id, name, email, plan_id, plan_expires_at FROM users WHERE id = ?', [req.user.id]);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const plan = db.get('SELECT * FROM plans WHERE id = ?', [user.plan_id]);
      const txs = db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [user.id]);

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
        subscription: {
          plan_id: user.plan_id,
          plan_name: plan ? plan.name : (user.plan_id === 'pro' ? 'Pro' : user.plan_id === 'unlimited' ? 'Unlimited' : 'Free'),
          plan_expires_at: user.plan_expires_at,
          daysRemaining,
          isPlanExpired,
          status: user.plan_id === 'free' ? 'free' : isPlanExpired ? 'expired' : 'active'
        },
        transactions: txs
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to retrieve transaction history' });
    }
  });

  return router;
};
