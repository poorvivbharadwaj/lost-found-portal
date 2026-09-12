const { Notification } = require('../models');

/**
 * Creates an in-app notification. Never throws — a notification failure
 * (e.g. bad email) should never block the admin action that triggered it.
 */
async function createNotification({ recipientEmail, type, title, message, relatedItem, relatedItemType }) {
  try {
    if (!recipientEmail) return null;
    return await Notification.create({
      recipientEmail: recipientEmail.trim().toLowerCase(),
      type,
      title,
      message,
      relatedItem,
      relatedItemType,
    });
  } catch (err) {
    console.error('Notification create error:', err.message);
    return null;
  }
}

module.exports = { createNotification };
