const Appointment = require('../models/Appointment');

async function createAppointment(req, res) {
  try {
    const { fullName, mobile, age, problem, preferredDate, preferredTime } = req.body;
    if (!fullName || !mobile || !age || !problem) {
      return res.status(400).json({ ok: false, error: 'missing required fields' });
    }

    //with the date format handling
    let dateObj = null;
    if (preferredDate) {
      const iso = new Date(preferredDate);
      if (!isNaN(iso.getTime())) dateObj = iso;
      else {
        const parts = String(preferredDate).split('/');
        if (parts.length === 3) {
          const [d, m, y] = parts.map((p) => Number(p));
          dateObj = new Date(y, m - 1, d);
        }
      }
    }

    const appt = await Appointment.create({
      userId: req.user._id,
      fullName,
      mobile,
      age,
      problem,
      preferredDate: dateObj,
      preferredTime: preferredTime || '',
      status: 'pending',
    });

    return res.status(201).json({ ok: true, appointment: appt });
  } catch (err) {
    console.error('createAppointment error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

async function listAppointments(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const userId = req.user._id;
    const [items, total] = await Promise.all([
      Appointment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Appointment.countDocuments({ userId }),
    ]);

    return res.json({ ok: true, data: items, meta: { total, page, limit } });
  } catch (err) {
    console.error('listAppointments error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

module.exports = { createAppointment, listAppointments };
