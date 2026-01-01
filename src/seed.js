
/**
 * Run: node src/seed.js
 * Make sure MONGO_URI is set in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Record = require('./models/Record');
const Appointment = require('./models/Appointment');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB for seeding');

  const username = 'demo';
  const password = 'secret123';
  let user = await User.findOne({ username });
  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ username, passwordHash: hash, fullName: 'Demo User', mobile: '9876543210' });
    console.log('Created demo user', username, '/', password);
  } else {
    console.log('Demo user already exists');
  }

  const recCount = await Record.countDocuments({ userId: user._id });
  if (recCount === 0) {
    await Record.create([
      {
        userId: user._id,
        summary: 'Fever and mild cough - 3 days',
        details: 'Patient reports fever of 101F for 3 days with occasional cough...',
        attachments: [],
      },
      {
        userId: user._id,
        summary: 'Headache after long screen time',
        details: 'Intermittent frontal headache, relieved by rest.',
        attachments: [],
      },
    ]);
    console.log('Created sample records');
  } else {
    console.log('Sample records already present:', recCount);
  }

  const apptCount = await Appointment.countDocuments({ userId: user._id });
  if (apptCount === 0) {
    await Appointment.create({
      userId: user._id,
      fullName: user.fullName || 'Demo User',
      mobile: user.mobile || '9876543210',
      age: 30,
      problem: 'Regular checkup',
      preferredDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      preferredTime: '10:30 AM',
      status: 'pending',
    });
    console.log('Created sample appointment');
  } else {
    console.log('Sample appointments already present:', apptCount);
  }

  await mongoose.disconnect();
  console.log('Seeding finished');
}

seed().catch((err) => {
  console.error('Seeding error', err);
  process.exit(1);
});
