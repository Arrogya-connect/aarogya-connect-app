const Session = require('../models/Session');
const User = require('../models/User');

async function sessionAuth(req, res, next) {
  try {
    const token = req.header('x-session-token');
    if (!token) return res.status(401).json({ ok: false, error: 'missing session token' });

    //finding session
    const session = await Session.findOne({ token });
    if (!session) return res.status(401).json({ ok: false, error: 'invalid session' });

    //checking validaity
    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({ ok: false, error: 'session expired' });
    }

    //getting user details excluding password
    const user = await User.findById(session.userId).select('-passwordHash');
    if (!user) return res.status(401).json({ ok: false, error: 'user not found' });

    req.user = user;
    req.session = session;
    next();
  } catch (err) {
    console.error('sessionAuth error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

module.exports = sessionAuth;
