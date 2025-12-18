// controllers/artworkController.js

const artworkModel = require('../models/artworkModel');

module.exports = {
  // ==============================
  // Open Edit Artwork page
  // ==============================
  async editArtworkPage(req, res) {
    try {
      const artworkId = parseInt(req.params.id, 10);
      if (Number.isNaN(artworkId)) {
        return res.status(400).send('Invalid artwork id');
      }

      const artwork = await artworkModel.getArtworkById(artworkId);
      if (!artwork) {
        return res.status(404).send('Artwork not found');
      }

      // Security: only creator can edit
      if (artwork.created_by !== req.session.userId) {
        return res.status(403).send('Access denied');
      }

      res.render('canvas/edit-artwork', {
        title: `Edit: ${artwork.title} - CYRUS`,
        artwork
      });
    } catch (err) {
      console.error('Error in editArtworkPage:', err);
      res.status(500).send('Error loading edit artwork page');
    }
  },

  // ==============================
  // Save edited artwork
  // ==============================
  async updateArtwork(req, res) {
    try {
      const artworkId = parseInt(req.params.id, 10);
      const { title, description, imageUrl, stateJson } = req.body;

      if (Number.isNaN(artworkId)) {
        return res.status(400).json({ success: false, message: 'Invalid artwork id' });
      }

      const artwork = await artworkModel.getArtworkById(artworkId);
      if (!artwork) {
        return res.status(404).json({ success: false, message: 'Artwork not found' });
      }

      // Security: only creator can update
      if (artwork.created_by !== req.session.userId) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      await artworkModel.updateArtwork(artworkId, {
        title: title || artwork.title,
        description: description || artwork.description || '',
        imageUrl,
        stateJson
      });

      return res.json({ success: true });
    } catch (err) {
      console.error('Error in updateArtwork:', err);
      res.status(500).json({ success: false, message: 'Server error updating artwork' });
    }
  }
};
