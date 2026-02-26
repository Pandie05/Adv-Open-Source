const express = require("express");
const { ensureAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", ensureAuth, (req, res) => {
  res.render("dashboard", { user: req.user });
});

module.exports = router;
