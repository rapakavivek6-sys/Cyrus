const express = require('express');
const router = express.Router();

const { requireLogin } = require('../middleware/auth');
const artworkController = require('../controllers/artworkController');

// Open editable canvas for a saved artwork
router.get('/artwork/:id/edit', requireLogin, artworkController.editArtworkPage);

// Save edited artwork back to the same artwork row
router.post('/artwork/:id/update', requireLogin, artworkController.updateArtwork);

module.exports = router;
