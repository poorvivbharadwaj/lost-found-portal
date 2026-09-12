import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ── Date Formatting ────────────────────────────────────────────────
const isDateOnlyValue = (value) => {
  if (!value) return false;
  if (typeof value === 'string') {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
      || /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000Z|Z)?$/.test(value);
  }
  if (value instanceof Date) {
    return value.getHours() === 0 && value.getMinutes() === 0 && value.getSeconds() === 0 && value.getMilliseconds() === 0;
  }
  return false;
};

export const formatDate = (date) => {
  if (!date) return 'Unknown date';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return 'Invalid date';
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'Unknown';
  if (isDateOnlyValue(date)) {
    return formatDate(date);
  }

  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return 'Invalid date';
  return format(d, 'MMM dd, yyyy • hh:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
};

// ── Validation ─────────────────────────────────────────────────────
export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone.replace(/[\s\-+91]/g, ''));

export const validateRequired = (value) =>
  value && value.toString().trim().length > 0;

// ── AI: Category Detection ─────────────────────────────────────────
const categoryRules = {
  id_card: ['id', 'card', 'identity', 'student', 'college', 'library', 'access', 'badge', 'pass', 'swipe'],
  electronics: ['phone', 'mobile', 'laptop', 'tablet', 'charger', 'earphone', 'headphone', 'watch', 'calculator', 'pendrive', 'usb', 'camera', 'keyboard', 'mouse', 'powerbank', 'airpods', 'earbuds'],
  books: ['book', 'notebook', 'textbook', 'notes', 'record', 'assignment', 'journal', 'diary', 'copy', 'register', 'lab', 'practical', 'file', 'binder', 'manual'],
  documents: ['document', 'certificate', 'marksheet', 'marks', 'hall ticket', 'admit', 'aadhar', 'pan', 'passport', 'license', 'result', 'transcript', 'degree', 'bonafide', '10th', '12th'],
};

export const detectCategory = (text = '') => {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryRules)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'other';
};

export const CATEGORIES = [
  { value: 'all',       label: 'All Items',          icon: '🗂️' },
  { value: 'id_card',   label: 'ID Cards',           icon: '🪪' },
  { value: 'electronics',label: 'Electronics',       icon: '📱' },
  { value: 'books',     label: 'Academic Items',     icon: '📚' },
  { value: 'documents', label: 'Personal Documents', icon: '📄' },
  { value: 'other',     label: 'Other',              icon: '📦' },
];

export const getCategoryLabel = (value) =>
  CATEGORIES.find(c => c.value === value)?.label || 'Unknown';

export const getCategoryIcon = (value) =>
  CATEGORIES.find(c => c.value === value)?.icon || '📦';

// ── Image validation (client-side AI heuristic) ────────────────────
const REJECTED_KEYWORDS = [
  'person', 'people', 'human', 'face', 'selfie', 'man', 'woman',
  'boy', 'girl', 'animal', 'dog', 'cat', 'bird', 'pet', 'food',
  'meal', 'drink', 'meme', 'screenshot of person',
];
export const validateImageTags = (tags = []) => {
  const normalized = tags.map(t => t.toLowerCase());
  const rejected = normalized.filter(t => REJECTED_KEYWORDS.some(k => t.includes(k)));
  if (rejected.length > 0) {
    return { valid: false, reason: `Invalid image detected (${rejected[0]}). Please upload a photo of the actual item.` };
  }
  return { valid: true };
};

// ── Misc ───────────────────────────────────────────────────────────
export const truncate = (text = '', max = 80) =>
  text.length > max ? text.slice(0, max) + '…' : text;

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const classNames = (...classes) =>
  classes.filter(Boolean).join(' ');

// ── Sorting ────────────────────────────────────────────────────────
export const sortItems = (items, sortKey, type = 'lost') => {
  if (!sortKey || !items?.length) return items || [];
  const sorted = [...items];

  const getName = (item) => {
    if (type === 'lost') return (item.itemName || '').toLowerCase();
    return (item.description || '').toLowerCase();
  };

  switch (sortKey) {
    case 'az':
      return sorted.sort((a, b) => getName(a).localeCompare(getName(b)));
    case 'za':
      return sorted.sort((a, b) => getName(b).localeCompare(getName(a)));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// ── Low-value item guideline check ──────────────────────────────────
// Mirrors backend/utils/validators.js isBlockedLowValueItem exactly —
// keep both in sync if this logic ever changes.
const BLOCKED_ITEM_WORDS = ['pen', 'pens', 'pencil', 'pencils', 'eraser', 'erasers', 'sharpener', 'sharpeners'];
const BLOCKED_ITEM_EXEMPTIONS = [/pen\s*-?\s*drive/i, /pendrive/i];
const DESCRIPTOR_WORDS = ['a', 'an', 'the', 'my', 'one', 'small', 'big', 'blue', 'black', 'red', 'green',
  'yellow', 'white', 'pink', 'purple', 'plastic', 'steel', 'wooden', 'wood', 'metal', 'simple', 'normal', 'ordinary'];

export const isBlockedLowValueItem = (itemName = '') => {
  const normalized = String(itemName).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return false;
  if (BLOCKED_ITEM_EXEMPTIONS.some(p => p.test(normalized))) return false;

  const words = normalized.split(' ').filter(w => !DESCRIPTOR_WORDS.includes(w));
  if (words.length === 0) return false;

  const core = words.join(' ');
  return BLOCKED_ITEM_WORDS.includes(core) || words.every(w => BLOCKED_ITEM_WORDS.includes(w));
};

export const BLOCKED_ITEM_MESSAGE = "This item does not meet the portal's reporting guidelines. Please report only items of reasonable importance, value, or personal identification.";
