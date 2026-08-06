const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('\n❌ MongoDB connection failed.');
    console.error('   Make sure MongoDB is running on port 27017.');
    console.error('   Try: brew services start mongodb-community');
    console.error(`   Error: ${error.message}\n`);
    throw error;
  }
};

module.exports = connectDB;
