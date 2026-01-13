const User = require('../models/User');

function transformUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.fullName || userDoc.username,
    username: userDoc.username,
    phone: userDoc.mobile || '',
    email: userDoc.email || '',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

async function me(req, res) {
  try {
    const user = req.user;
    return res.json({ ok: true, user: transformUser(user) });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

async function updateMe(req, res) {
  try {
    const user = req.user; // loaded by sessionAuth
    const { phone, email } = req.body;

    // Only accept phone and email for now
    if (phone !== undefined) {
      if (typeof phone !== 'string') return res.status(400).json({ ok: false, error: 'phone must be string' });
      const digits = (phone || '').toString().replace(/\D/g, '');
      user.mobile = digits;
    }

    if (email !== undefined) {
      if (typeof email !== 'string') return res.status(400).json({ ok: false, error: 'email must be string' });
      user.email = email.trim().toLowerCase();
    }

    await user.save();

    return res.json({ ok: true, user: transformUser(user) });
  } catch (err) {
    console.error('updateMe error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

module.exports = { me, updateMe };