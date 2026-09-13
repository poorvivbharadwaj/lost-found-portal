const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.id === 'hardcoded-admin') {
      // The hardcoded fallback account is only valid until an admin record
      // exists in the database. Once credentials have been changed/migrated
      // to the database, tokens issued against the fallback must stop working.
      const anyAdmin = await Admin.exists({});
      if (anyAdmin) {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
      // Never trust a role claimed by the frontend/token payload alone —
      // the hardcoded bootstrap token is only ever issued server-side with
      // role: 'admin' (see routes/auth.js), so this is a sanity check, not
      // the source of truth.
      if (decoded.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin privileges required.' });
      }
      req.admin = decoded;
      return next();
    }

    // Server-side confirmation that the authenticated user actually has the
    // admin role — never trust `role`/`isAdmin`/user IDs sent from the
    // frontend or embedded in the JWT payload itself.
    const admin = await Admin.findById(decoded.id).select('username role tokenVersion');
    if (!admin || (admin.tokenVersion || 0) !== (decoded.tokenVersion || 0)) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required.' });
    }

    req.admin = { id: admin._id, username: admin.username, role: admin.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
