const mongoose = require('mongoose');

/**
 * Connect to MongoDB using Mongoose with retry handling
 */
const connectDB = async (retries = 3, delayMs = 1500) => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri === 'PASTE_MY_MONGODB_CONNECTION_STRING_HERE') {
    console.error('Error: MONGO_URI is not configured in server/.env');
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        dbName: 'returniq',
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });

      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      if (attempt === retries) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
      }
      console.log(`MongoDB connection attempt ${attempt} failed (${error.message}). Retrying in ${delayMs / 1000}s...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
};

module.exports = connectDB;
