// controllers/canvasController.js

const canvasModel = require('../models/canvasModel');
const teamModel = require('../models/teamModel');
const artworkModel = require('../models/artworkModel');

module.exports = {
  // Show a single canvas page
  async showCanvas(req, res) {
    try {
      const canvasId = parseInt(req.params.id, 10);
      if (Number.isNaN(canvasId)) {
        return res.status(400).send('Invalid canvas id');
      }

      const canvas = await canvasModel.getCanvasById(canvasId);
      if (!canvas) {
        return res.status(404).send('Canvas not found');
      }

      // Optional: check that user belongs to the team that owns this canvas
      if (canvas.team_id && req.session.userId) {
        const membership = await teamModel.userInTeam(req.session.userId, canvas.team_id);
        if (!membership) {
          return res.status(403).send('Access denied');
        }
      }

      res.render('canvas/canvas', {
        title: `${canvas.name} - CYRUS`,
        canvas
      });
    } catch (err) {
      console.error('Error in showCanvas:', err);
      res.status(500).send('Error loading canvas');
    }
  },

  // Save current canvas as an artwork (called from /canvas/save via fetch)
  async saveCanvas(req, res) {
    try {
      const { title, description, imageUrl } = req.body;
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Login required' });
      }

      if (!title || !imageUrl) {
        return res
          .status(400)
          .json({ success: false, message: 'Title and image are required' });
      }

      const artworkId = await artworkModel.createArtwork({
        title,
        description: description || 'Created on CYRUS collaborative canvas',
        imageUrl,
        userId
      });

      return res.json({ success: true, artworkId });
    } catch (err) {
      console.error('Error in saveCanvas:', err);
      res.status(500).json({ success: false, message: 'Server error saving artwork' });
    }
  }
};
