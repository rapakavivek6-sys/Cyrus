const userModel = require('../models/userModel');
const artworkModel = require('../models/artworkModel');
const pool = require('../db/index');

module.exports = {
  async showProfile(req, res) {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const user = await userModel.findById(userId);

    const [[stats]] = await pool.query(
      `SELECT COUNT(*) AS artwork_count
         FROM artworks
        WHERE created_by = ?`,
      [userId]
    );

    const artworks = await artworkModel.getAllArtworks();
    const myArtworks = artworks.filter(a => a.created_by === userId);

    res.render('profile/profile', {
      title: 'Profile - CYRUS',
      user,
      stats,
      artworks: myArtworks
    });
  },

  async showEditProfile(req, res) {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const user = await userModel.findById(userId);

    res.render('profile/edit-profile', {
      title: 'Edit Profile - CYRUS',
      user
    });
  },

  async updateProfile(req, res) {
    const userId = req.session.userId;
    if (!userId) return res.redirect('/login');

    const { display_name, bio } = req.body;
    await userModel.updateProfile(userId, { display_name, bio });
    res.redirect('/profile');
  }
};
