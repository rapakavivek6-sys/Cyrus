const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

function ensureLoggedIn(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.get('/profile', ensureLoggedIn, profileController.showProfile);
router.get('/profile/edit', ensureLoggedIn, profileController.showEditProfile);
router.post('/profile/edit', ensureLoggedIn, profileController.updateProfile);

module.exports = router;
