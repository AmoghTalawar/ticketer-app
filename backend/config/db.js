const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS for SRV record resolution (fixes ISP DNS issues)
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    // MongoDB connection events
    mongoose.connection.on('connected', () => {
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
      console.log(`📦 Database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB Disconnected');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    });
    
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n📋 Troubleshooting tips:');
    console.error('  1. Go to https://cloud.mongodb.com and verify your cluster is running');
    console.error('  2. Go to Security > Database Access — confirm username "ananya" exists');
    console.error('  3. Go to Security > Network Access — add 0.0.0.0/0 to allow all IPs');
    console.error('  4. Reset the password and update MONGODB_URI in backend/.env');
    console.error('\n⚠️  Server will continue running but DB operations will fail.\n');
    // Don't exit — allow server to start so health check works
  }
};

module.exports = connectDB;
