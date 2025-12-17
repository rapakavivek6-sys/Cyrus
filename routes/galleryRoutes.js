const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

router.get('/gallery', galleryController.showGallery);
router.get('/gallery/:id', galleryController.showArtwork);

module.exports = router;
