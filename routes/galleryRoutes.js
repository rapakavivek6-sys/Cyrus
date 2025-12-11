// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();

const galleryController = require('../controllers/galleryController');
const { requireLogin } = require('../middleware/auth');

// Gallery listing & view – PROTECTED
router.get('/gallery', requireLogin, galleryController.showGallery);
router.get('/gallery/:id', requireLogin, galleryController.showArtwork);

module.exports = router;