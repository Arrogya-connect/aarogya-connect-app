
const express = require('express');
const router = express.Router();
const sessionAuth = require('../middleware/sessionAuth');
const { createAppointment, listAppointments } = require('../controllers/appointmentController');

router.post('/', sessionAuth, createAppointment);
router.get('/', sessionAuth, listAppointments);

module.exports = router;
