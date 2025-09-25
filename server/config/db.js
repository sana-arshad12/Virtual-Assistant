import mongoose from "mongoose";

// Establish a MongoDB connection and log status
const connectDB = async () => {
    const uri = process.env.MONGODB_URL;
    if (!uri) {
        console.error("MONGODB_URL is not defined in environment variables");
        process.exit(1);
    }
    try {
        await mongoose.connect(uri);
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;