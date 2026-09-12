const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Notification } = require('../models');
const { JWT_SECRET } = require('../middleware/verification');

/**
 * Notifications belong to an email address, but there is no user login
 * system in this app (reports are submitted anonymously + OTP-verified).
 * To avoid letting anyone read anyone else's notifications just by
 * guessing an email, every request here must include the same
 * verificationToken issued by /api/verification/verify-otp, and the
 * token's contact must match the requested email.
 */
function requireOwnedEmail(req, res, next) {
  const email = (req.query.email || req.body.email || '').trim().toLowerCase();
  const token = req.query.verificationToken || req.body.verificationToken;

  if (!email || !token) {
    return res.status(400).json({ success: false, message: 'Email and verification token are required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.contactType !== 'email' || decoded.contact !== email) {
      return res.status(403).json({ success: false, message: 'Verification does not match this email.' });
    }
    req.verifiedEmail = email;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Verification expired or invalid. Please verify your email again.' });
  }
}

// GET /api/notifications?email=&verificationToken=&page=&limit=
router.get('/', requireOwnedEmail, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);

    const filter = { recipientEmail: req.verifiedEmail };
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, read: false }),
    ]);

    res.json({ success: true, items, total, unreadCount, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load notifications.' });
  }
});

// GET /api/notifications/unread-count?email=&verificationToken=
router.get('/unread-count', requireOwnedEmail, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipientEmail: req.verifiedEmail, read: false });
    res.json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load unread count.' });
  }
});

// PATCH /api/notifications/:id/read  { email, verificationToken }
router.patch('/:id/read', requireOwnedEmail, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientEmail: req.verifiedEmail },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update notification.' });
  }
});

// PATCH /api/notifications/read-all  { email, verificationToken }
router.patch('/read-all', requireOwnedEmail, async (req, res) => {
  try {
    await Notification.updateMany({ recipientEmail: req.verifiedEmail, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update notifications.' });
  }
});

// DELETE /api/notifications/:id  ?email=&verificationToken=
router.delete('/:id', requireOwnedEmail, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipientEmail: req.verifiedEmail });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete notification.' });
  }
});

module.exports = router;
