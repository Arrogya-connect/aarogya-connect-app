const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
const multer = require('multer');
const { listRecords, getRecord, createRecord, streamAttachment } = require('../controllers/recordController');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

router.get('/', sessionAuth, listRecords);
router.get('/:id', sessionAuth, getRecord);
router.post('/', sessionAuth, upload.array('attachments'), createRecord);

// stream attachment: GET /api/records/:id/attachment/:idx
router.get('/:id/attachment/:idx', sessionAuth, streamAttachment);

module.exports = router;