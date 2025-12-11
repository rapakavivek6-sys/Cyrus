const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const teamModel = require('../models/teamModel');

module.exports = {
  showLogin(req, res) {
    res.render('auth/login', {
      title: 'Login - CYRUS',
      error: req.flash('error')
    });
  },

  showRegister(req, res) {
    res.render('auth/register', {
      title: 'Register - CYRUS',
      error: req.flash('error')
    });
  },

  // ============= REGISTER =============
  async register(req, res) {
    try {
      const { username, email, password, display_name } = req.body;

      if (!username || !email || !password) {
        req.flash('error', 'Please fill all required fields.');
        return res.redirect('/register');
      }

      // Check if email already in use
      const existing = await userModel.findByEmail(email);
      if (existing) {
        req.flash('error', 'Email already in use.');
        return res.redirect('/register');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const displayName = display_name || username;

      // Create user in DB
      const userId = await userModel.createUser({
        username,
        email,
        passwordHash,
        displayName
      });

      // Optional: create a default team for the user
      try {
        await teamModel.createTeam(`${displayName}'s Studio`, userId);
      } catch (e) {
        console.warn('Could not create default team for user', userId, e.message);
      }

      // Store full user info in session
      req.session.userId = userId;
      req.session.username = username;
      req.session.displayName = displayName;
      req.session.email = email;

      req.flash('success', 'Welcome to CYRUS!');
      return res.redirect('/profile');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Registration failed.');
      return res.redirect('/register');
    }
  },

  // ============= LOGIN =============
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', 'Please enter email and password.');
        return res.redirect('/login');
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        req.flash('error', 'Invalid credentials.');
        return res.redirect('/login');
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        req.flash('error', 'Invalid credentials.');
        return res.redirect('/login');
      }

      // Store full user info in session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.displayName = user.display_name;
      req.session.email = user.email;

      req.flash('success', `Welcome back, ${user.display_name || user.username}!`);
      return res.redirect('/profile');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Login failed.');
      return res.redirect('/login');
    }
  },

  // ============= LOGOUT =============
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
};
