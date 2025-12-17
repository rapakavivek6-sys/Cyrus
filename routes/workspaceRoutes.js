const express = require('express');
const router = express.Router();
const teamModel = require('../models/teamModel');
const canvasModel = require('../models/canvasModel');

function ensureLoggedIn(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.get('/workspaces', ensureLoggedIn, async (req, res) => {
  const teams = await teamModel.getTeamsForUser(req.session.userId);
  res.render('workspaces/index', {
    title: 'Workspaces - CYRUS',
    teams
  });
});

router.get('/workspaces/:teamId/canvases', ensureLoggedIn, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const membership = await teamModel.userInTeam(req.session.userId, teamId);
  if (!membership) return res.status(403).send('Access denied');

  const canvases = await canvasModel.getCanvasesForTeam(teamId);
  res.render('workspaces/team-canvases', {
    title: 'Canvases - CYRUS',
    teamId,
    canvases
  });
});

router.post('/workspaces/:teamId/canvases', ensureLoggedIn, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const membership = await teamModel.userInTeam(req.session.userId, teamId);
  if (!membership) return res.status(403).send('Access denied');

  const { name } = req.body;
  const canvasId = await canvasModel.createCanvas({
    teamId,
    name,
    createdBy: req.session.userId
  });
  res.redirect(`/canvas/${canvasId}`);
});

module.exports = router;
