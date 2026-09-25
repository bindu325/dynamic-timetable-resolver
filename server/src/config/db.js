const mongoose = require('mongoose');

/**
 * Clean MongoDB / MongoDB Atlas connection module.
 * Connects directly using process.env.MONGO_URI.
 * Does not expose passwords/credentials in logs or errors.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (
    !mongoUri ||
    mongoUri.trim() === '' ||
    mongoUri.includes('<YOUR_CLUSTER_HOST>') ||
    mongoUri.includes('<YOUR_USERNAME>') ||
    mongoUri.includes('<cluster-url>') ||
    mongoUri.includes('YOUR_CLUSTER_HOST') ||
    mongoUri.includes('YOUR_MONGODB_URI') ||
    mongoUri.includes('YOUR_CONNECTION_STRING') ||
    mongoUri.includes('YOUR_MONGODB_ATLAS_CONNECTION_STRING')
  ) {
    const errorMsg = 'MONGO_URI contains unconfigured placeholder values. Please set your actual MongoDB Atlas connection string in server/.env.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
    });

    console.log(`[MongoDB] MongoDB Atlas connected successfully (Host: ${conn.connection.host}, DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    // Sanitize error message to avoid leaking any connection URI details with credentials
    console.error('[Database Error] Failed to connect to MongoDB Atlas:', error.message);
    throw error;
  }
};

module.exports = connectDB;
