const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async () => {
  try {
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection disconnected');
    });

    const conn = await mongoose.connect(env.MONGODB_URI, connectionOptions);
    return conn;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error('   Error message:', error.message);
    console.warn('   Tip: Ensure your MongoDB Atlas connection string is configured in backend/.env');
    // If in development and Mongo is not reachable, do not crash process immediately so other routes/health can be inspected
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDatabase;
