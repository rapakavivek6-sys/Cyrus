require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");

const indexRoutes = require("./src/routes/index");
const authRoutes = require("./src/routes/auth");
const canvasRoutes = require("./src/routes/canvas");
const galleryRoutes = require("./src/routes/gallery");
const profileRoutes = require("./src/routes/profile");

const app = express();

// View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cyrussecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Global template middleware (user info)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
app.use("/", indexRoutes);
app.use("/", authRoutes); // /login, /register, /logout
app.use("/canvas", canvasRoutes);
app.use("/gallery", galleryRoutes);
app.use("/profile", profileRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).render("index", {
    title: "CYRUS - Not Found",
    errorMessage: "Page not found",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CYRUS app listening on http://localhost:${PORT}`);
});
