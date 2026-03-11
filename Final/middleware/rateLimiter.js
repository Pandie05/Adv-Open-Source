import rateLimit from "express-rate-limit";
import BlockedRequest from "../models/BlockedRequest.js";

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  handler: async (req, res) => {

    await BlockedRequest.create({
      ip: req.ip,
      endpoint: req.originalUrl
    });

    res.status(429).json({
      message: "Too many requests. Please try again later."
    });
  }
});
