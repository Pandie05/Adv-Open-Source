const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register", { error: null, form: {} });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword)
      return res.status(400).render("register", { error: "All fields required.", form: { username, email } });

    if (password !== confirmPassword)
      return res.status(400).render("register", { error: "Passwords do not match.", form: { username, email } });

    if (password.length < 8)
      return res.status(400).render("register", { error: "Password must be at least 8 characters.", form: { username, email } });

    const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existing)
      return res.status(409).render("register", { error: "Username or email already exists.", form: { username, email } });

    const hash = await bcrypt.hash(password, 12);

    await User.create({
      username,
      email: email.toLowerCase(),
      password: hash
    });

    return res.redirect("/login");
  } catch {
    return res.status(500).render("error", { message: "Registration error." });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { error: null, form: {} });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return res.status(500).render("error", { message: "Login error." });
    if (!user) return res.status(401).render("login", { error: "Invalid credentials.", form: { identifier: req.body.identifier } });

    req.logIn(user, err2 => {
      if (err2) return res.status(500).render("error", { message: "Session error." });
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.redirect("/login"));
  });
});

module.exports = router;
