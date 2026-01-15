const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth'); // we'll create next
const usersRoutes = require('./routes/users');
const recordsRoutes = require('./routes/records');
const appointmentsRoutes = require('./routes/appointments');

const app = express();

// Middlewares
app.set('trust proxy', 1); // Trust first proxy (Vercel)
app.use(helmet());
app.use(cors()); // for demo you can restrict to frontend origin later
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// simple rate limiter for auth
app.use('/api/auth', rateLimit({
  windowMs: 60 * 1000,
  max: 10,
}));

// routes (placeholders — will be implemented next)
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/appointments', appointmentsRoutes);

// health
app.get('/healthz', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.send('Aarogya Connect Backend is Running on Vercel v2.0'));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Server error' });
});

module.exports = app;