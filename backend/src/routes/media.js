const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
const { getUploadSignature } = require('../controllers/mediaController');

// Helper to check connection or config
router.get('/config', (req, res) => {
    // Only return non-sensitive info if needed
    res.json({ ok: true });
});

// GET /api/media/signature
router.get('/signature', sessionAuth, getUploadSignature);

module.exports = router;
