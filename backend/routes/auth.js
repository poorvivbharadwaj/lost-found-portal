const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { Admin } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Slows down brute-force attempts against the admin login (including
// the hardcoded ADMIN_USERNAME/ADMIN_PASSWORD fallback below).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // The hardcoded fallback only ever applies before any admin record has
    // been created in the database (first-run bootstrap). Once an admin
    // exists in MongoDB (e.g. after a credentials change), the database is
    // the sole source of truth and the fallback is fully disabled.
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (username === adminUsername && password === adminPassword) {
        const token = jwt.sign(
          { id: 'hardcoded-admin', username, role: 'admin', tokenVersion: 0 },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({ 
          success: true, 
          token, 
          admin: { username, role: 'admin' },
          message: 'Login successful'
        });
      }
    }

    // Check DB admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role, tokenVersion: admin.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token, 
      admin: { username: admin.username, role: admin.role },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// POST /api/auth/verify
router.get('/verify', require('../middleware/auth'), (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
