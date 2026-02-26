const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

module.exports = function(passport) {
  passport.use(new LocalStrategy({ usernameField: "identifier" }, async (identifier, password, done) => {
    try {
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier.toLowerCase() }]
      });
      if (!user) return done(null, false);
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select("-password");
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
