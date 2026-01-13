
const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
const { me,updateMe } = require('../controllers/userController');

router.get('/me', sessionAuth, me);
router.put('/me', sessionAuth, updateMe);

module.exports = router;
