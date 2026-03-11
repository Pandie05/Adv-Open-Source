import express from "express";
import BlockedRequest from "../models/BlockedRequest.js";

const router = express.Router();

router.get("/blocked", async (req, res) => {
  const logs = await BlockedRequest.find().sort({ timestamp: -1 });
  res.json(logs);
});

export default router;