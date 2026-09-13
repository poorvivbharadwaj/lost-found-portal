const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js');
const { LostItem, FoundItem } = require('../models');

// GET /api/search?q=wallet&category=electronics&type=lost&sort=newest
router.get('/', async (req, res) => {
  try {
    const { q, category, type, dateFrom, dateTo, sort = 'newest' } = req.query;
    const sortOrder = sort === 'oldest' ? 1 : -1;

    const baseFilter = { approved: true };
    if (category && category !== 'all') baseFilter.category = category;

    let lostItems = [], foundItems = [];

    if (type !== 'found') {
      const lostFilter = { ...baseFilter };
      if (dateFrom) lostFilter.lostDate = { $gte: new Date(dateFrom) };
      if (dateTo) lostFilter.lostDate = { ...lostFilter.lostDate, $lte: new Date(dateTo) };
      // Search results are public — reporter email/phone are excluded.
      lostItems = await LostItem.find(lostFilter).select('-email -phone').sort({ createdAt: sortOrder }).limit(100);
    }

    if (type !== 'lost') {
      const foundFilter = { ...baseFilter };
      if (dateFrom) foundFilter.foundDate = { $gte: new Date(dateFrom) };
      if (dateTo) foundFilter.foundDate = { ...foundFilter.foundDate, $lte: new Date(dateTo) };
      // Search results are public — finder's contact email/phone are excluded.
      foundItems = await FoundItem.find(foundFilter).select('-contactEmail -contactPhone').sort({ createdAt: sortOrder }).limit(100);
    }

    // Apply Fuse.js fuzzy search if a query is provided — case-insensitive
    // and supports partial matches across item name, description, reporter/finder name, and location.
    if (q && q.trim()) {
      const fuseLostOptions = {
        keys: ['itemName', 'description', 'reporterName'],
        threshold: 0.4,
        includeScore: true,
      };
      const fuseFoundOptions = {
        keys: ['description', 'finderName', 'foundLocation'],
        threshold: 0.4,
        includeScore: true,
      };

      if (lostItems.length > 0) {
        const fuse = new Fuse(lostItems, fuseLostOptions);
        lostItems = fuse.search(q).map(r => r.item);
      }

      if (foundItems.length > 0) {
        const fuse = new Fuse(foundItems, fuseFoundOptions);
        foundItems = fuse.search(q).map(r => r.item);
      }
    }

    res.json({ success: true, lostItems, foundItems, total: lostItems.length + foundItems.length });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ success: false, message: 'Search failed. Please try again.' });
  }
});

module.exports = router;
