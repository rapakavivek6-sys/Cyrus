// routes/canvasRoutes.js
const express = require('express');
const router = express.Router();

const { requireLogin } = require('../middleware/auth');
const canvasController = require('../controllers/canvasController');

// View a canvas (must be logged in)
router.get('/canvas/:id', requireLogin, canvasController.showCanvas);

// Save the current canvas to the gallery (AJAX from client)
router.post('/canvas/save', requireLogin, canvasController.saveCanvas);

module.exports = router;
