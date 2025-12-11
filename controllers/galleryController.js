const artworkModel = require('../models/artworkModel');

module.exports = {
  async showGallery(req, res) {
    const artworks = await artworkModel.getAllArtworks();
    res.render('gallery/gallery', {
      title: 'Gallery - CYRUS',
      artworks
    });
  },

  async showArtwork(req, res) {
    const id = req.params.id;
    const artwork = await artworkModel.getArtworkById(id);
    if (!artwork) return res.status(404).send('Not found');
    res.render('gallery/artwork', {
      title: artwork.title + ' - CYRUS',
      artwork
    });
  }
};
