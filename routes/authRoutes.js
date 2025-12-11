// routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Show login & register forms
router.get('/login', authController.showLogin);
router.get('/register', authController.showRegister);

// Handle form submissions
router.post('/login', authController.login);
router.post('/register', authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
