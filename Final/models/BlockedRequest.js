import mongoose from "mongoose";

const blockedRequestSchema = new mongoose.Schema({
  ip: String,
  endpoint: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("BlockedRequest", blockedRequestSchema);