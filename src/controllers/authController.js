const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Session = require('../models/Session');

const SALT_ROUNDS = 10;

async function register(req, res) {
  try {
    const { username, password, fullName, mobile } = req.body;
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'username and password required' });
    }
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) return res.status(409).json({ ok: false, error: 'username taken' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      username: username.toLowerCase().trim(),
      passwordHash,
      fullName: fullName || '',
      mobile: mobile || '',
    });
    return res.status(201).json({
      ok: true,
      user: { _id: user._id, username: user.username, fullName: user.fullName },
    });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'username and password required' });
    }
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) return res.status(401).json({ ok: false, error: 'invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ ok: false, error: 'invalid credentials' });

    const token = uuidv4();
    const ttlHours = Number(process.env.SESSION_TTL_HOURS || 48);
    const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);

    await Session.create({ token, userId: user._id, expiresAt });

    return res.json({
      ok: true,
      token,
      user: { _id: user._id, username: user.username, fullName: user.fullName },
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}
async function logout(req, res) {
  try {
    // If route uses sessionAuth middleware, req.session exists
    if (req.session && req.session._id) {
      await Session.deleteOne({ _id: req.session._id });
      return res.json({ ok: true });
    }

    // Fallback: allow deleting by token header
    const token = req.header('x-session-token');
    if (!token) return res.status(400).json({ ok: false, error: 'missing session token' });

    await Session.deleteOne({ token });
    return res.json({ ok: true });
  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

module.exports = { register, login ,logout};