// backend/src/routes/records.js
const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
const { listRecords, getRecord, createRecord, streamAttachment } = require('../controllers/recordController');

router.get('/', sessionAuth, listRecords);
router.get('/:id', sessionAuth, getRecord);
router.post('/', sessionAuth, createRecord); // Removed upload.any()

// stream attachment (redirects to Cloudinary)
router.get('/:id/attachment/:idx', sessionAuth, streamAttachment);

module.exports = router;