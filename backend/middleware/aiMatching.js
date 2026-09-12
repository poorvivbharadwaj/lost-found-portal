const Fuse = require('fuse.js');

// Category keyword mapping for simple AI-based classification
const categoryKeywords = {
  id_card: ['id', 'card', 'identity', 'student', 'college', 'library', 'access', 'badge', 'pass'],
  electronics: ['phone', 'mobile', 'laptop', 'tablet', 'charger', 'earphone', 'headphone', 'watch', 'calculator', 'pendrive', 'usb', 'camera', 'keyboard', 'mouse', 'power bank'],
  books: ['book', 'notebook', 'textbook', 'notes', 'record', 'assignment', 'journal', 'diary', 'copy', 'register', 'lab manual', 'practical', 'file'],
  documents: ['document', 'certificate', 'marksheet', 'marks card', 'hall ticket', 'admit card', 'aadhar', 'pan', 'passport', 'license', 'result', 'transcript', 'degree', 'bonafide'],
};

// Detect category from item name and description
const detectCategory = (itemName = '', description = '') => {
  const text = `${itemName} ${description}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  return 'other';
};

// Validate image for relevant content using Cloudinary AI tags
const validateImageCategory = (tags = []) => {
  const normalizedTags = tags.map(t => t.toLowerCase());
  
  // Reject humans and animals
  const rejectTags = ['person', 'people', 'human', 'face', 'man', 'woman', 'boy', 'girl', 
                       'animal', 'dog', 'cat', 'bird', 'pet', 'wildlife'];
  
  const hasRejected = rejectTags.some(tag => normalizedTags.includes(tag));
  if (hasRejected) {
    return { valid: false, reason: 'Image contains humans or animals. Please upload a photo of the item.' };
  }

  // Accept relevant object tags
  const validTags = ['card', 'book', 'electronics', 'phone', 'laptop', 'document', 
                      'paper', 'text', 'technology', 'object', 'item', 'bag', 'wallet',
                      'key', 'watch', 'accessory', 'stationery'];
  
  const hasValid = validTags.some(tag => normalizedTags.some(t => t.includes(tag)));
  
  // If no specific tags match, allow it (better UX - don't over-restrict)
  return { valid: true, category: detectCategory(normalizedTags.join(' ')) };
};

// Smart matching algorithm using Fuse.js
const findMatches = async (newItem, existingItems, type = 'found') => {
  if (!existingItems || existingItems.length === 0) return [];

  const fuseOptions = {
    keys: [
      { name: 'itemName', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'category', weight: 0.2 }
    ],
    threshold: 0.4, // Lower = stricter match
    includeScore: true,
  };

  // For lost items search, map fields
  const searchItems = existingItems.map(item => ({
    ...item._doc || item,
    itemName: item.itemName || item.description || '',
    description: item.description || '',
    category: item.category || 'other',
  }));

  const fuse = new Fuse(searchItems, fuseOptions);
  
  const searchQuery = type === 'found' 
    ? `${newItem.description} ${newItem.category}`
    : `${newItem.itemName} ${newItem.description}`;

  const results = fuse.search(searchQuery);
  
  // Filter by date proximity (within 14 days)
  const dateFiltered = results.filter(result => {
    const itemDate = new Date(result.item.lostDate || result.item.foundDate || result.item.createdAt);
    const newDate = new Date(newItem.foundDate || newItem.lostDate || new Date());
    const diffDays = Math.abs((newDate - itemDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  });

  return dateFiltered.slice(0, 3).map(r => ({
    item: r.item,
    score: Math.round((1 - r.score) * 100),
  }));
};

// Calculate text similarity (simple word-overlap ratio, 0–1)
const similarity = (str1 = '', str2 = '') => {
  const a = (str1 || '').toLowerCase().split(/\W+/).filter(Boolean);
  const b = (str2 || '').toLowerCase().split(/\W+/).filter(Boolean);
  if (a.length === 0 || b.length === 0) return 0;
  const intersection = a.filter(word => b.includes(word));
  return intersection.length / Math.max(a.length, b.length);
};

/**
 * Weighted similarity score between a lost item and a found item, plus
 * which fields contributed enough to count as "matched" — used to show
 * admins *why* two posts were suggested as a pair.
 */
const scoreMatchPair = (lost, found) => {
  const nameSim = similarity(lost.itemName, found.description);
  const descSim = similarity(lost.description, found.description);
  const categoryMatch = lost.category && found.category && lost.category === found.category;

  const lostDate = new Date(lost.lostDate || lost.createdAt);
  const foundDate = new Date(found.foundDate || found.createdAt);
  const diffDays = Math.abs((foundDate - lostDate) / (1000 * 60 * 60 * 24));
  const dateProximity = diffDays <= 1 ? 1 : diffDays <= 3 ? 0.7 : diffDays <= 7 ? 0.4 : diffDays <= 14 ? 0.2 : 0;

  const weightedScore = (nameSim * 0.35) + (descSim * 0.25) + (categoryMatch ? 0.2 : 0) + (dateProximity * 0.2);
  const score = Math.round(weightedScore * 100);

  const matchedFields = [];
  if (categoryMatch) matchedFields.push('category');
  if (descSim >= 0.15) matchedFields.push('description');
  if (nameSim >= 0.15) matchedFields.push('keywords');
  if (dateProximity > 0) matchedFields.push('date');

  return { score, matchedFields };
};

const MATCH_THRESHOLD = 35;

/**
 * Compares a newly created/approved item against opposite-type approved
 * items and stores any candidates above the threshold as PossibleMatch
 * documents for admin review — it does NOT auto-link items or notify
 * reporters. Safe to call multiple times (upserts on the lost/found pair).
 */
const generateMatchCandidates = async (item, type) => {
  // Lazy require avoids a circular dependency with models/index.js at module load time.
  const { LostItem, FoundItem, PossibleMatch } = require('../models');
  const candidates = [];

  try {
    if (type === 'lost') {
      const foundItems = await FoundItem.find({ approved: true, matched: false });
      for (const found of foundItems) {
        const { score, matchedFields } = scoreMatchPair(item, found);
        if (score >= MATCH_THRESHOLD) {
          candidates.push(
            PossibleMatch.findOneAndUpdate(
              { lostItem: item._id, foundItem: found._id },
              { score, matchedFields, $setOnInsert: { status: 'pending' } },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            )
          );
        }
      }
    } else {
      const lostItems = await LostItem.find({ approved: true, matched: false });
      for (const lost of lostItems) {
        const { score, matchedFields } = scoreMatchPair(lost, item);
        if (score >= MATCH_THRESHOLD) {
          candidates.push(
            PossibleMatch.findOneAndUpdate(
              { lostItem: lost._id, foundItem: item._id },
              { score, matchedFields, $setOnInsert: { status: 'pending' } },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            )
          );
        }
      }
    }
    return await Promise.all(candidates);
  } catch (err) {
    console.error('Match candidate generation error:', err.message);
    return [];
  }
};

module.exports = { detectCategory, validateImageCategory, findMatches, similarity, scoreMatchPair, generateMatchCandidates, MATCH_THRESHOLD };
