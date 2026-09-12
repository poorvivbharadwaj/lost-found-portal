const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile, numeric only

const isValidEmail = (email) => typeof email === 'string' && EMAIL_REGEX.test(email.trim());

const isValidPhone = (phone) => {
  if (typeof phone !== 'string' || !phone.trim()) return false;
  const cleaned = phone.replace(/[\s\-+]/g, '');
  return PHONE_REGEX.test(cleaned);
};

/**
 * Validates a lost/found report payload. Returns an array of human-readable
 * error strings (empty array = valid). Set phoneRequired:true to make phone
 * compulsory (still validated for format either way if provided).
 */
function validateReportPayload({ requiredFields = {}, email, phone, phoneRequired = false, description, minDescriptionLength = 10 }) {
  const errors = [];

  for (const [label, value] of Object.entries(requiredFields)) {
    if (!value || !String(value).trim()) {
      errors.push(`${label} is required.`);
    }
  }

  if (email !== undefined && email !== null && email !== '') {
    if (!isValidEmail(email)) errors.push('Please provide a valid email address.');
  }

  if (phoneRequired && (!phone || !String(phone).trim())) {
    errors.push('Phone number is required.');
  } else if (phone !== undefined && phone !== null && phone !== '') {
    if (!isValidPhone(phone)) errors.push('Phone number must be exactly 10 digits (numeric only).');
  }

  if (description !== undefined) {
    if (!description || !description.trim()) {
      errors.push('Description is required.');
    } else if (description.trim().length < minDescriptionLength) {
      errors.push(`Description must be at least ${minDescriptionLength} characters.`);
    }
  }

  return errors;
}

// Items too low-value/common to be worth reporting on the portal.
// Deliberately conservative: only blocks when the item name IS essentially
// just one of these words (optionally with a color/material descriptor),
// never when it's part of a different item (e.g. "Pen Drive" / "Pencil Case").
const BLOCKED_ITEM_WORDS = ['pen', 'pens', 'pencil', 'pencils', 'eraser', 'erasers', 'sharpener', 'sharpeners'];
const BLOCKED_ITEM_EXEMPTIONS = [/pen\s*-?\s*drive/i, /pendrive/i];
const DESCRIPTOR_WORDS = ['a', 'an', 'the', 'my', 'one', 'small', 'big', 'blue', 'black', 'red', 'green',
  'yellow', 'white', 'pink', 'purple', 'plastic', 'steel', 'wooden', 'wood', 'metal', 'simple', 'normal', 'ordinary'];

function isBlockedLowValueItem(itemName = '') {
  const normalized = String(itemName).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return false;
  if (BLOCKED_ITEM_EXEMPTIONS.some(p => p.test(normalized))) return false;

  const words = normalized.split(' ').filter(w => !DESCRIPTOR_WORDS.includes(w));
  if (words.length === 0) return false;

  const core = words.join(' ');
  return BLOCKED_ITEM_WORDS.includes(core) || words.every(w => BLOCKED_ITEM_WORDS.includes(w));
}

const BLOCKED_ITEM_MESSAGE = "This item does not meet the portal's reporting guidelines. Please report only items of reasonable importance, value, or personal identification.";

module.exports = { isValidEmail, isValidPhone, validateReportPayload, isBlockedLowValueItem, BLOCKED_ITEM_MESSAGE, EMAIL_REGEX, PHONE_REGEX };
