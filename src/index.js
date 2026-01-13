// backend/src/index.js
require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const PORT = parseInt(process.env.PORT, 10) || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI not set in environment');
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server listening on http://${HOST}:${PORT}`);
    });

    // Graceful shutdown
    const graceful = async () => {
      console.log('Shutting down gracefully...');
      server.close(async (err) => {
        if (err) {
          console.error('Error while closing server:', err);
          process.exit(1);
        }
        try {
          await mongoose.disconnect();
          console.log('MongoDB disconnected.');
          process.exit(0);
        } catch (e) {
          console.error('Error disconnecting MongoDB:', e);
          process.exit(1);
        }
      });

      // Force exit if shutdown hangs
      setTimeout(() => {
        console.error('Forcing shutdown.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGINT', graceful);
    process.on('SIGTERM', graceful);

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      // Optionally exit here: process.exit(1)
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();