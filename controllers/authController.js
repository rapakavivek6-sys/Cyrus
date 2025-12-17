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

  async register(req, res) {
    try {
      const { username, email, password, display_name } = req.body;
      if (!username || !email || !password) {
        req.flash('error', 'Please fill all required fields.');
        return res.redirect('/register');
      }

      const existing = await userModel.findByEmail(email);
      if (existing) {
        req.flash('error', 'Email already in use.');
        return res.redirect('/register');
      }

      const hash = await bcrypt.hash(password, 10);
      const userId = await userModel.createUser({
        username,
        email,
        passwordHash: hash,
        displayName: display_name || username
      });

      // Create a default workspace for this user
      const defaultTeamName = `${display_name || username}'s Workspace`;
      await teamModel.createTeam(defaultTeamName, userId);

      req.session.userId = userId;
      req.flash('success', 'Welcome to CYRUS!');
      res.redirect('/workspaces');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Registration failed.');
      res.redirect('/register');
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
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
      req.session.userId = user.id;
      res.redirect('/workspaces');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Login failed.');
      res.redirect('/login');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
};
