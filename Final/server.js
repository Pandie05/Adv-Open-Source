import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

import apiRoutes from "./routes/apiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", apiLimiter, apiRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Rate Limiting API Demo");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});