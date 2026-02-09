import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongodb connected: ${conn.connection.host} (db: ${conn.connection.name})`);
  } catch (err) {
    console.error("mongodb connection error:", err.message);
    process.exit(1);
  }
}
