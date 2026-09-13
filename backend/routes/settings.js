const express = require('express');
const router = express.Router();
const { Settings } = require('../models');

// Hardcoded fallback used only if the database has no settings document yet
// or if the lookup fails for any reason (e.g. transient DB issue). This
// mirrors the original default office information so the public pages never
// show a blank/broken state.
const DEFAULT_OFFICE_INFO = {
  officeLocation: 'Room No 405, Campus Office',
  officeEmail: 'lostfound@college.edu',
  officePhone: '+91-XXXXXXXXXX',
};

// GET /api/settings/office — public, read-only. Returns ONLY the official
// Campus Office contact information. Never combine this with private
// reporter contact details (reporter email/phone).
router.get('/office', async (req, res) => {
  try {
    const settings = await Settings.findOne({ singletonKey: 'global' })
      .select('officeLocation officeEmail officePhone -_id');

    if (!settings) {
      return res.json({ success: true, office: DEFAULT_OFFICE_INFO });
    }

    res.json({
      success: true,
      office: {
        officeLocation: settings.officeLocation,
        officeEmail: settings.officeEmail,
        officePhone: settings.officePhone,
      },
    });
  } catch (error) {
    console.error('Settings route error:', error.message);
    // Fall back to defaults rather than failing the page.
    res.json({ success: true, office: DEFAULT_OFFICE_INFO });
  }
});

module.exports = router;
