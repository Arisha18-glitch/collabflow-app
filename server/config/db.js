const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('⏳ Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
        if (error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND')) {
            console.error('👉 Fix: Go to MongoDB Atlas → Security → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
