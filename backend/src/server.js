const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/owr-plan';

// Connect to MongoDB then start server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected natively');
  } catch (err) {
    console.log('⚠️  Native MongoDB not found — starting in-memory database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log('✅ In-memory MongoDB running');

      // Auto-seed demo data
      console.log('🌱 Seeding demo data...');
      const seed = require('../seed');
      await seed();
      console.log('✅ Demo data seeded (user: test@example.com / password123)');
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();

