const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  res.render("login", { title: "Login - CYRUS" });
};

exports.getRegister = (req, res) => {
  res.render("register", { title: "Register - CYRUS" });
};

exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, handle, bio } = req.body;

    if (!name || !email || !password || !confirmPassword || !handle) {
      return res.render("register", {
        title: "Register - CYRUS",
        errorMessage: "All fields marked * are required.",
        formData: req.body,
      });
    }

    if (password !== confirmPassword) {
      return res.render("register", {
        title: "Register - CYRUS",
        errorMessage: "Passwords do not match.",
        formData: req.body,
      });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.render("register", {
        title: "Register - CYRUS",
        errorMessage: "Email already in use.",
        formData: req.body,
      });
    }

    const normalizedHandle =
      handle.startsWith("@") ? handle.trim() : `@${handle.trim()}`;

    const existingHandle = await User.findByHandle(normalizedHandle);
    if (existingHandle) {
      return res.render("register", {
        title: "Register - CYRUS",
        errorMessage: "Handle already taken.",
        formData: req.body,
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const userId = await User.create({
      name,
      email,
      password_hash,
      handle: normalizedHandle,
      bio: bio || "",
    });

    const user = await User.findById(userId);
    req.session.user = {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      bio: user.bio,
    };

    res.redirect("/profile");
  } catch (err) {
    console.error("Register error:", err);
    res.render("register", {
      title: "Register - CYRUS",
      errorMessage: "Something went wrong. Try again.",
      formData: req.body,
    });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render("login", {
        title: "Login - CYRUS",
        errorMessage: "Please enter both email and password.",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.render("login", {
        title: "Login - CYRUS",
        errorMessage: "Invalid email or password.",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render("login", {
        title: "Login - CYRUS",
        errorMessage: "Invalid email or password.",
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      handle: user.handle,
      email: user.email,
      bio: user.bio,
    };

    res.redirect("/profile");
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", {
      title: "Login - CYRUS",
      errorMessage: "Something went wrong. Try again.",
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};