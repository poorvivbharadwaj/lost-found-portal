const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const bcrypt = require('bcryptjs');
const { LostItem, FoundItem, PossibleMatch, Admin, Settings } = require('../models');
const { isValidEmail } = require('../utils/validators');
const authMiddleware = require('../middleware/auth');
const { sendApprovalEmail, sendRejectionEmail, sendMatchEmail } = require('../middleware/email');
const { createNotification } = require('../middleware/notifications');
const { generateMatchCandidates } = require('../middleware/aiMatching');
const { upload, uploadToCloudinary, cloudinary } = require('../middleware/cloudinary');

// All admin routes require auth
router.use(authMiddleware);

// ── Dashboard Stats ──────────────────────────────────────────────
// GET /api/admin/dashboard — stats overview
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalLost, totalFound,
      pendingLost, pendingFound,
      approvedLost, approvedFound,
      rejectedLost, rejectedFound,
      archivedLost, archivedFound,
      matchedItems,
      pendingMatches,
    ] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      LostItem.countDocuments({ status: 'pending' }),
      FoundItem.countDocuments({ status: 'pending' }),
      LostItem.countDocuments({ status: 'approved' }),
      FoundItem.countDocuments({ status: 'approved' }),
      LostItem.countDocuments({ status: 'rejected' }),
      FoundItem.countDocuments({ status: 'rejected' }),
      LostItem.countDocuments({ status: { $in: ['archived', 'resolved'] } }),
      FoundItem.countDocuments({ status: { $in: ['archived', 'resolved'] } }),
      LostItem.countDocuments({ matched: true }),
      PossibleMatch.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalPosts: totalLost + totalFound,
        totalLost,
        totalFound,
        pending: pendingLost + pendingFound,
        pendingLost,
        pendingFound,
        approved: approvedLost + approvedFound,
        approvedLost,
        approvedFound,
        rejected: rejectedLost + rejectedFound,
        rejectedLost,
        rejectedFound,
        archived: archivedLost + archivedFound,
        archivedLost,
        archivedFound,
        matchedItems,
        pendingMatches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load dashboard stats.' });
  }
});

// ── Helpers ───────────────────────────────────────────────────────
const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

async function listItems(Model, req, res, searchKeys) {
  try {
    const { status, q, sort = 'newest', page = 1, limit = 20, category } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status === 'archived' ? { $in: ['archived', 'resolved'] } : status;
    }
    if (category && category !== 'all') filter.category = category;

    let items = await Model.find(filter).sort(SORT_MAP[sort] || SORT_MAP.newest);

    if (q && q.trim()) {
      const fuse = new Fuse(items, { keys: searchKeys, threshold: 0.4 });
      items = fuse.search(q.trim()).map(r => r.item);
    }

    const total = items.length;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const paged = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ success: true, items: paged, total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load items.' });
  }
}

// GET /api/admin/lost — all lost items with search/filter/sort/pagination
router.get('/lost', (req, res) => listItems(LostItem, req, res, ['itemName', 'description', 'reporterName']));

// GET /api/admin/found — all found items with search/filter/sort/pagination
router.get('/found', (req, res) => listItems(FoundItem, req, res, ['description', 'finderName']));

// ── Approve ───────────────────────────────────────────────────────
router.patch('/lost/:id/approve', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.email) {
      await sendApprovalEmail(item.email, item.itemName, 'lost');
      await createNotification({
        recipientEmail: item.email,
        type: 'approved',
        title: 'Your lost item report was approved',
        message: `"${item.itemName}" is now live on the portal.`,
        relatedItem: item._id,
        relatedItemType: 'LostItem',
      });
    }

    // Re-run matching now that this item is approved and visible
    generateMatchCandidates(item, 'lost').catch(err => console.error('Matching error:', err.message));

    res.json({ success: true, message: 'Lost item approved and reporter notified.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to approve item.' });
  }
});

router.patch('/found/:id/approve', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.contactEmail) {
      await createNotification({
        recipientEmail: item.contactEmail,
        type: 'approved',
        title: 'Your found item report was approved',
        message: `Your found item report is now live on the portal.`,
        relatedItem: item._id,
        relatedItemType: 'FoundItem',
      });
    }

    // Re-run matching now that this item is approved and visible
    generateMatchCandidates(item, 'found').catch(err => console.error('Matching error:', err.message));

    res.json({ success: true, message: 'Found item approved.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to approve item.' });
  }
});

// ── Reject ────────────────────────────────────────────────────────
router.patch('/lost/:id/reject', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'rejected' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.email) {
      await sendRejectionEmail(item.email, item.itemName, 'lost', req.body?.reason);
      await createNotification({
        recipientEmail: item.email,
        type: 'rejected',
        title: 'Your lost item report was rejected',
        message: req.body?.reason || `"${item.itemName}" did not meet the posting guidelines.`,
        relatedItem: item._id,
        relatedItemType: 'LostItem',
      });
    }

    res.json({ success: true, message: 'Lost item rejected.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to reject item.' });
  }
});

router.patch('/found/:id/reject', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'rejected' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.contactEmail) {
      await sendRejectionEmail(item.contactEmail, item.description, 'found', req.body?.reason);
      await createNotification({
        recipientEmail: item.contactEmail,
        type: 'rejected',
        title: 'Your found item report was rejected',
        message: req.body?.reason || 'Your report did not meet the posting guidelines.',
        relatedItem: item._id,
        relatedItemType: 'FoundItem',
      });
    }

    res.json({ success: true, message: 'Found item rejected.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to reject item.' });
  }
});

// ── Edit ──────────────────────────────────────────────────────────
const EDITABLE_LOST_FIELDS = ['itemName', 'description', 'category', 'lostDate', 'email', 'phone', 'reporterName', 'lastSeenLocation'];
const EDITABLE_FOUND_FIELDS = ['itemName', 'description', 'category', 'foundLocation', 'foundDate', 'contactEmail', 'contactPhone', 'finderName'];

router.patch('/lost/:id', upload.single('image'), async (req, res) => {
  try {
    const payload = {};
    for (const key of EDITABLE_LOST_FIELDS) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (payload.lostDate) payload.lostDate = new Date(payload.lostDate);

    const existing = await LostItem.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      payload.imageUrl = result.secure_url;
      payload.imagePublicId = result.public_id;
      if (existing.imagePublicId) {
        cloudinary.uploader.destroy(existing.imagePublicId).catch(err => console.error('Cloudinary cleanup error:', err.message));
      }
    }

    const item = await LostItem.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json({ success: true, message: 'Lost item updated.', item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to update item.' });
  }
});

router.patch('/found/:id', upload.single('image'), async (req, res) => {
  try {
    const payload = {};
    for (const key of EDITABLE_FOUND_FIELDS) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (payload.foundDate) payload.foundDate = new Date(payload.foundDate);

    const existing = await FoundItem.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      payload.imageUrl = result.secure_url;
      payload.imagePublicId = result.public_id;
      if (existing.imagePublicId) {
        cloudinary.uploader.destroy(existing.imagePublicId).catch(err => console.error('Cloudinary cleanup error:', err.message));
      }
    }

    const item = await FoundItem.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json({ success: true, message: 'Found item updated.', item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to update item.' });
  }
});

// ── Archive ───────────────────────────────────────────────────────
// Archiving hides an approved post from the public site without deleting it.
router.patch('/lost/:id/archive', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'archived' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.email) {
      await createNotification({
        recipientEmail: item.email,
        type: 'archived',
        title: 'Your post was archived',
        message: `"${item.itemName}" has been archived and removed from public listings.`,
        relatedItem: item._id,
        relatedItemType: 'LostItem',
      });
    }

    res.json({ success: true, message: 'Lost item archived.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to archive item.' });
  }
});

router.patch('/found/:id/archive', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: false, status: 'archived' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.contactEmail) {
      await createNotification({
        recipientEmail: item.contactEmail,
        type: 'archived',
        title: 'Your post was archived',
        message: 'Your found item report has been archived and removed from public listings.',
        relatedItem: item._id,
        relatedItemType: 'FoundItem',
      });
    }

    res.json({ success: true, message: 'Found item archived.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to archive item.' });
  }
});

// ── Restore ───────────────────────────────────────────────────────
router.patch('/lost/:id/restore', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.email) {
      await createNotification({
        recipientEmail: item.email,
        type: 'restored',
        title: 'Your post was restored',
        message: `"${item.itemName}" is visible on the portal again.`,
        relatedItem: item._id,
        relatedItemType: 'LostItem',
      });
    }

    res.json({ success: true, message: 'Lost item restored.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to restore item.' });
  }
});

router.patch('/found/:id/restore', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: 'approved' },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });

    if (item.contactEmail) {
      await createNotification({
        recipientEmail: item.contactEmail,
        type: 'restored',
        title: 'Your post was restored',
        message: 'Your found item report is visible on the portal again.',
        relatedItem: item._id,
        relatedItemType: 'FoundItem',
      });
    }

    res.json({ success: true, message: 'Found item restored.', item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to restore item.' });
  }
});

// ── Permanent Delete ──────────────────────────────────────────────
// Frontend must show a confirmation dialog before calling these.
router.delete('/lost/:id', async (req, res) => {
  try {
    const item = await LostItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Lost item permanently deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete item.' });
  }
});

router.delete('/found/:id', async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Found item permanently deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete item.' });
  }
});

// ── Possible Matches (admin review queue) ────────────────────────
// GET /api/admin/matches?status=pending
router.get('/matches', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const filter = status === 'all' ? {} : { status };
    const matches = await PossibleMatch.find(filter)
      .populate('lostItem')
      .populate('foundItem')
      .sort({ score: -1, createdAt: -1 });

    // Skip stale candidates whose underlying item was deleted
    const valid = matches.filter(m => m.lostItem && m.foundItem);
    res.json({ success: true, matches: valid });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load possible matches.' });
  }
});

// PATCH /api/admin/matches/:id/confirm
router.patch('/matches/:id/confirm', async (req, res) => {
  try {
    const match = await PossibleMatch.findById(req.params.id).populate('lostItem').populate('foundItem');
    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });
    if (!match.lostItem || !match.foundItem) {
      return res.status(400).json({ success: false, message: 'One of the matched items no longer exists.' });
    }

    await LostItem.findByIdAndUpdate(match.lostItem._id, { matched: true, matchedWith: match.foundItem._id });
    await FoundItem.findByIdAndUpdate(match.foundItem._id, { matched: true, matchedWith: match.lostItem._id });
    match.status = 'confirmed';
    await match.save();

    // Any other pending candidates involving either item are now moot
    await PossibleMatch.updateMany(
      {
        _id: { $ne: match._id },
        status: 'pending',
        $or: [{ lostItem: match.lostItem._id }, { foundItem: match.foundItem._id }],
      },
      { status: 'ignored' }
    );

    if (match.lostItem.email) {
      await sendMatchEmail(match.lostItem.email, match.lostItem.itemName, match.foundItem.description);
      await createNotification({
        recipientEmail: match.lostItem.email,
        type: 'match_found',
        title: 'A match was found for your lost item!',
        message: `Your "${match.lostItem.itemName}" may match a found item. Visit the Lost & Found office to verify and collect it.`,
        relatedItem: match.lostItem._id,
        relatedItemType: 'LostItem',
      });
    }
    if (match.foundItem.contactEmail) {
      await createNotification({
        recipientEmail: match.foundItem.contactEmail,
        type: 'match_found',
        title: 'Your found item was matched!',
        message: `The item you found has been matched with its owner. Thank you for helping reunite it!`,
        relatedItem: match.foundItem._id,
        relatedItemType: 'FoundItem',
      });
    }

    res.json({ success: true, message: 'Match confirmed and both parties notified.', match });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to confirm match.' });
  }
});

// PATCH /api/admin/matches/:id/ignore
router.patch('/matches/:id/ignore', async (req, res) => {
  try {
    const match = await PossibleMatch.findByIdAndUpdate(req.params.id, { status: 'ignored' }, { new: true });
    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });
    res.json({ success: true, message: 'Match ignored.', match });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to ignore match.' });
  }
});

// ── Change Admin Credentials ──────────────────────────────────────
// PATCH /api/admin/change-credentials
// Requires the caller to already hold a valid admin session (authMiddleware
// above) AND to re-supply their current username/password for verification.
router.patch('/change-credentials', async (req, res) => {
  const GENERIC_ERROR = 'Current username or password is incorrect.';

  try {
    const { currentUsername, currentPassword, newUsername, newPassword, confirmNewPassword } = req.body || {};

    if (!currentUsername || !currentPassword) {
      return res.status(400).json({ success: false, message: 'Current username and password are required.' });
    }

    const trimmedNewUsername = typeof newUsername === 'string' ? newUsername.trim() : '';
    const hasNewUsername = trimmedNewUsername.length > 0;
    const hasNewPassword = typeof newPassword === 'string' && newPassword.length > 0;

    if (!hasNewUsername && !hasNewPassword) {
      return res.status(400).json({ success: false, message: 'Enter a new username or a new password to update.' });
    }

    if (hasNewPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ success: false, message: 'New password and confirmation do not match.' });
      }
    }

    // ── Verify current credentials ──────────────────────────────────
    let adminDoc = await Admin.findOne({ username: currentUsername });

    if (adminDoc) {
      const matches = await bcrypt.compare(currentPassword, adminDoc.password);
      if (!matches) {
        return res.status(401).json({ success: false, message: GENERIC_ERROR });
      }
    } else {
      // No DB record for this username yet — only acceptable if the caller is
      // still on the hardcoded bootstrap account (i.e. no admin migrated yet).
      const adminCount = await Admin.countDocuments();
      const fallbackUsername = process.env.ADMIN_USERNAME || 'admin';
      const fallbackPassword = process.env.ADMIN_PASSWORD || 'admin123';

      const isFallbackMatch = adminCount === 0
        && currentUsername === fallbackUsername
        && currentPassword === fallbackPassword;

      if (!isFallbackMatch) {
        return res.status(401).json({ success: false, message: GENERIC_ERROR });
      }
    }

    const finalUsername = hasNewUsername ? trimmedNewUsername : currentUsername;

    // ── Prevent duplicate usernames ─────────────────────────────────
    if (finalUsername !== currentUsername) {
      const duplicate = await Admin.findOne({ username: finalUsername });
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'That username is already taken.' });
      }
    }

    const finalPasswordHash = hasNewPassword
      ? await bcrypt.hash(newPassword, 10)
      : (adminDoc ? adminDoc.password : await bcrypt.hash(currentPassword, 10));

    if (adminDoc) {
      adminDoc.username = finalUsername;
      adminDoc.password = finalPasswordHash;
      adminDoc.tokenVersion = (adminDoc.tokenVersion || 0) + 1;
      await adminDoc.save();
    } else {
      // First time migrating off the hardcoded fallback account into the
      // database — this updates the *existing* logical admin account, it
      // does not create a second admin.
      await Admin.create({
        username: finalUsername,
        password: finalPasswordHash,
        role: 'admin',
        tokenVersion: 1,
      });
    }

    res.json({ success: true, message: 'Admin credentials updated successfully. Please log in again.' });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'That username is already taken.' });
    }
    console.error('Change credentials error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to update credentials right now.' });
  }
});

// ── Campus Office Settings (public office info, admin-editable) ────
// PATCH /api/admin/settings/office
// Requires a valid admin session (authMiddleware above already enforces
// 401/403). Upserts the single global Settings document — never creates a
// second one. Kept entirely separate from private reporter contact fields.
router.patch('/settings/office', async (req, res) => {
  try {
    const officeLocation = typeof req.body?.officeLocation === 'string' ? req.body.officeLocation.trim() : '';
    const officeEmail = typeof req.body?.officeEmail === 'string' ? req.body.officeEmail.trim() : '';
    const officePhone = typeof req.body?.officePhone === 'string' ? req.body.officePhone.trim() : '';

    const errors = [];
    if (!officeLocation) errors.push('Office location is required.');
    if (!officeEmail) {
      errors.push('Office email is required.');
    } else if (!isValidEmail(officeEmail)) {
      errors.push('Please provide a valid office email address.');
    }
    if (!officePhone) {
      errors.push('Office phone is required.');
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(officePhone)) {
      errors.push('Please provide a valid office phone number.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const updated = await Settings.findOneAndUpdate(
      { singletonKey: 'global' },
      { $set: { officeLocation, officeEmail, officePhone } },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Campus Office information updated successfully.',
      office: {
        officeLocation: updated.officeLocation,
        officeEmail: updated.officeEmail,
        officePhone: updated.officePhone,
      },
    });
  } catch (error) {
    console.error('Update office settings error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to update office information right now.' });
  }
});

module.exports = router;
