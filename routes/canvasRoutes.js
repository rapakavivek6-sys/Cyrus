const express = require('express');
const router = express.Router();
const canvasController = require('../controllers/canvasController');

function ensureLoggedIn(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.get('/canvas/:id', ensureLoggedIn, canvasController.showCanvas);
router.post('/canvas/save', ensureLoggedIn, canvasController.saveCanvas);

module.exports = router;
