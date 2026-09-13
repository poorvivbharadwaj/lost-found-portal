const mongoose = require('mongoose');

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: { 
    type: String, 
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number']
  }
}, { timestamps: true });

// Lost Item Model
const lostItemSchema = new mongoose.Schema({
  reporterName: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  phone: { type: String, required: true, trim: true },
  itemName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  lastSeenLocation: { type: String, trim: true, default: '' },
  category: { 
    type: String, 
    enum: ['id_card', 'electronics', 'books', 'documents', 'other'],
    default: 'other'
  },
  lostDate: { type: Date, required: true },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  approved: { type: Boolean, default: false },
  matched: { type: Boolean, default: false },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'archived', 'resolved'], default: 'pending' }
}, { timestamps: true });

// Found Item Model
const foundItemSchema = new mongoose.Schema({
  finderName: { type: String, required: true, trim: true },
  itemName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['id_card', 'electronics', 'books', 'documents', 'other'],
    default: 'other'
  },
  foundLocation: { type: String, default: 'Room No 405', trim: true },
  contactEmail: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  contactPhone: { type: String, required: true, trim: true },
  foundDate: { type: Date, default: Date.now },
  imageUrl: { type: String },
  imagePublicId: { type: String },
  approved: { type: Boolean, default: false },
  matched: { type: Boolean, default: false },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'archived', 'resolved'], default: 'pending' }
}, { timestamps: true });

// Admin Model
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  // Bumped every time credentials change so previously-issued JWTs
  // (which embed the tokenVersion at login time) stop being accepted.
  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const LostItem = mongoose.model('LostItem', lostItemSchema);
const FoundItem = mongoose.model('FoundItem', foundItemSchema);
// OTP Verification Model
const otpSchema = new mongoose.Schema({
  contact: { type: String, required: true, trim: true },
  contactType: { type: String, enum: ['email', 'phone'], required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
}, { timestamps: true });

otpSchema.index({ contact: 1, contactType: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Notification Model — one doc per user-facing event
const notificationSchema = new mongoose.Schema({
  recipientEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
  type: {
    type: String,
    enum: ['approved', 'rejected', 'archived', 'restored', 'match_found'],
    required: true,
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  relatedItem: { type: mongoose.Schema.Types.ObjectId },
  relatedItemType: { type: String, enum: ['LostItem', 'FoundItem'] },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipientEmail: 1, createdAt: -1 });

// Possible Match Model — a candidate match awaiting admin review
const possibleMatchSchema = new mongoose.Schema({
  lostItem: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
  foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  score: { type: Number, required: true },
  matchedFields: [{ type: String }],
  status: { type: String, enum: ['pending', 'confirmed', 'ignored'], default: 'pending' },
}, { timestamps: true });

possibleMatchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
possibleMatchSchema.index({ status: 1, score: -1 });

const Admin = mongoose.model('Admin', adminSchema);
const OtpVerification = mongoose.model('OtpVerification', otpSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const PossibleMatch = mongoose.model('PossibleMatch', possibleMatchSchema);

// Settings Model — a single global document holding publicly-visible
// Campus Office contact information. This is intentionally kept completely
// separate from private reporter contact fields (email/phone, contactEmail/
// contactPhone) stored on LostItem/FoundItem above. Only one document of
// this collection is ever created; it is looked up/created via a fixed
// singleton key so repeated admin updates never create duplicate records.
const settingsSchema = new mongoose.Schema({
  singletonKey: { type: String, default: 'global', unique: true, required: true },
  officeLocation: { type: String, trim: true, default: 'Room No 405, Campus Office' },
  officeEmail: {
    type: String,
    trim: true,
    default: 'lostfound@college.edu',
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid office email'],
  },
  officePhone: { type: String, trim: true, default: '+91-XXXXXXXXXX' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { User, LostItem, FoundItem, Admin, OtpVerification, Notification, PossibleMatch, Settings };
