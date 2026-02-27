require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");

const configurePassport = require("./config/passport");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


// cookies so my app does not explode
app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.redirect("/login"));
app.use(authRoutes);
app.use(dashboardRoutes);

app.use((req, res) => res.status(404).render("error", { message: "Page not found." }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
