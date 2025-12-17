const canvasModel = require('../models/canvasModel');
const teamModel = require('../models/teamModel');
const artworkModel = require('../models/artworkModel');

module.exports = {
  async showCanvas(req, res) {
    const canvasId = parseInt(req.params.id, 10);
    const canvas = await canvasModel.getCanvasById(canvasId);
    if (!canvas) return res.status(404).send('Canvas not found');

    const membership = await teamModel.userInTeam(req.session.userId, canvas.team_id);
    if (!membership) return res.status(403).send('Access denied');

    res.render('canvas/canvas', {
      title: `${canvas.name} - CYRUS`,
      canvas
    });
  },

  async saveCanvas(req, res) {
    try {
      const { title, description, imageUrl } = req.body;
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Login required' });

      const artworkId = await artworkModel.createArtwork({
        title,
        description,
        imageUrl,
        userId
      });

      res.json({ success: true, artworkId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }
};
