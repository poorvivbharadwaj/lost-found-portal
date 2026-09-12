const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

/**
 * Validates verification token from OTP flow.
 * Token must match the contact (email or phone) in the request body.
 */
const requireVerification = (req, res, next) => {
  const token = req.body.verificationToken;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Contact verification required. Please verify your email or phone with OTP before submitting.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.purpose !== 'report') {
      return res.status(403).json({ success: false, message: 'Invalid verification token.' });
    }

    req.verifiedContact = decoded.contact;
    req.verifiedContactType = decoded.contactType;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Verification expired or invalid. Please verify your contact again.',
    });
  }
};

/**
 * Ensures submitted contact matches the verified token.
 */
const matchVerifiedContact = (req, res, next) => {
  const { email, phone, contactEmail, contactPhone } = req.body;
  const verified = req.verifiedContact?.toLowerCase();
  const verifiedType = req.verifiedContactType;

  if (verifiedType === 'email') {
    const submittedEmail = (email || contactEmail || '').trim().toLowerCase();
    if (submittedEmail !== verified) {
      return res.status(403).json({ success: false, message: 'Verified email does not match submitted email.' });
    }
  } else if (verifiedType === 'phone') {
    const submittedPhone = (phone || contactPhone || '').replace(/[\s\-+]/g, '');
    if (submittedPhone !== verified) {
      return res.status(403).json({ success: false, message: 'Verified phone does not match submitted phone.' });
    }
  }

  next();
};

module.exports = { requireVerification, matchVerifiedContact, JWT_SECRET };
