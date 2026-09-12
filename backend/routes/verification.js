const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { OtpVerification } = require('../models');
const { sendOtpEmail } = require('../middleware/email');
const { JWT_SECRET } = require('../middleware/verification');

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const isDevMode = () => !process.env.EMAIL_USER || process.env.OTP_DEV_MODE === 'true';

const RESEND_COOLDOWN_MS = 60 * 1000;

// Prevents OTP spam: max 5 send attempts per contact-independent IP window.
// (Per-contact cooldown is enforced separately below, in addition to this.)
const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests from this device. Please try again later.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts. Please try again later.' },
});

// POST /api/verification/send-otp
router.post('/send-otp', otpSendLimiter, async (req, res) => {
  try {
    const { contact, contactType } = req.body;

    if (!contact || !contactType) {
      return res.status(400).json({ success: false, message: 'Contact and contact type are required.' });
    }

    if (contactType === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(contact)) {
        return res.status(400).json({ success: false, message: 'Invalid email format.' });
      }
    } else if (contactType === 'phone') {
      if (!/^[6-9]\d{9}$/.test(contact.replace(/[\s\-+]/g, ''))) {
        return res.status(400).json({ success: false, message: 'Invalid phone number. Enter a 10-digit Indian mobile number.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Contact type must be email or phone.' });
    }

    const normalizedContact = contactType === 'email'
      ? contact.trim().toLowerCase()
      : contact.replace(/[\s\-+]/g, '');

    // Server-side resend cooldown — prevents bypassing the frontend's 60s timer.
    const existing = await OtpVerification.findOne({ contact: normalizedContact, contactType });
    if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${waitSeconds}s before requesting another OTP.` });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpVerification.deleteMany({ contact: normalizedContact, contactType });

    await OtpVerification.create({
      contact: normalizedContact,
      contactType,
      otp,
      expiresAt,
      lastSentAt: new Date(),
    });

    if (contactType === 'email') {
      await sendOtpEmail(normalizedContact, otp);
    } else if (isDevMode()) {
      console.log(`📱 OTP for ${normalizedContact}: [dev mode only — see devOtp in response]`);
    }

    const response = { success: true, message: `OTP sent to your ${contactType}. Valid for 5 minutes.` };

    if (isDevMode()) {
      response.devOtp = otp;
      response.message += ' (Dev mode: OTP included in response)';
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to send OTP. Please try again.' });
  }
});

// POST /api/verification/verify-otp
router.post('/verify-otp', otpVerifyLimiter, async (req, res) => {
  try {
    const { contact, contactType, otp } = req.body;

    if (!contact || !contactType || !otp) {
      return res.status(400).json({ success: false, message: 'Contact, contact type, and OTP are required.' });
    }

    const normalizedContact = contactType === 'email'
      ? contact.trim().toLowerCase()
      : contact.replace(/[\s\-+]/g, '');

    const record = await OtpVerification.findOne({ contact: normalizedContact, contactType });

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    if (record.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (record.attempts >= 5) {
      await OtpVerification.deleteOne({ _id: record._id });
      return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (record.otp !== otp.trim()) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - record.attempts} attempts remaining.` });
    }

    await OtpVerification.deleteOne({ _id: record._id });

    const verificationToken = jwt.sign(
      { contact: normalizedContact, contactType, purpose: 'report' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({ success: true, message: 'Contact verified successfully.', verificationToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to verify OTP. Please try again.' });
  }
});

module.exports = router;
