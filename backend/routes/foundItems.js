const express = require('express');
const router = express.Router();
const { FoundItem, LostItem } = require('../models');
const { upload, uploadToCloudinary } = require('../middleware/cloudinary');
const { detectCategory, generateMatchCandidates } = require('../middleware/aiMatching');
const { requireVerification, matchVerifiedContact } = require('../middleware/verification');
const { validateReportPayload, isBlockedLowValueItem, BLOCKED_ITEM_MESSAGE } = require('../utils/validators');

// GET /api/found
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { approved: true };
    if (category && category !== 'all') filter.category = category;

    const items = await FoundItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await FoundItem.countDocuments(filter);
    res.json({ success: true, items, total });
  } catch (error) {
    console.error('Route error:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// GET /api/found/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    console.error('Route error:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// POST /api/found
router.post('/', upload.single('image'), requireVerification, matchVerifiedContact, async (req, res) => {
  try {
    const { finderName, itemName, description, category: manualCategory, contactEmail, contactPhone } = req.body;

    const validationErrors = validateReportPayload({
      requiredFields: { 'Finder name': finderName, 'Item name': itemName },
      email: contactEmail,
      phone: contactPhone,
      phoneRequired: true,
      description,
      minDescriptionLength: 20,
    });
    if (!contactEmail) validationErrors.push('Email is required.');

    if (validationErrors.length > 0) {
      return res.status(400).json({ success: false, message: validationErrors[0], errors: validationErrors });
    }

    if (isBlockedLowValueItem(itemName)) {
      return res.status(400).json({ success: false, message: BLOCKED_ITEM_MESSAGE });
    }

    const category = manualCategory || detectCategory(itemName, description);

    const itemData = {
      finderName,
      itemName,
      description,
      category,
      foundLocation: 'Room No 405',
      contactEmail,
      contactPhone,
      foundDate: new Date(),
      approved: false,
    };

    // Upload image if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
        itemData.imageUrl = result.secure_url;
        itemData.imagePublicId = result.public_id;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError.message);
        // Continue without image
      }
    }

    const foundItem = new FoundItem(itemData);
    await foundItem.save();

    // Generate match candidates for admin review (no auto-linking, no reporter emails yet)
    try {
      await generateMatchCandidates(foundItem, 'found');
    } catch (matchError) {
      console.error('Matching error:', matchError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Found item reported successfully! It will be visible after admin approval.',
      item: foundItem
    });
  } catch (error) {
    console.error('Found item post error:', error);
    res.status(500).json({ success: false, message: 'Unable to submit report. Please try again.' });
  }
});

// DELETE /api/found/:id
router.delete('/:id', require('../middleware/auth'), async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Route error:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;