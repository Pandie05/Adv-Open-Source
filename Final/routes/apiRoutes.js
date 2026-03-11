import express from "express";

const router = express.Router();

router.get("/data", (req, res) => {
  res.json({
    message: "API request successful",
    time: new Date()
  });
});

export default router;