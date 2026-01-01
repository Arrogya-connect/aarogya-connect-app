const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const sessionAuth = require('../middleware/sessionAuth');

router.post('/register', register);
router.post('/login', login);
router.delete('/logout', sessionAuth, logout);

module.exports = router;