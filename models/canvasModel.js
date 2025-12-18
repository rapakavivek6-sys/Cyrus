// models/canvasModel.js
const pool = require('../db/index');

module.exports = {
  // ✅ Find an existing canvas by team + name (so team shares the same canvas)
  async getCanvasByTeamAndName(teamId, name) {
    const [rows] = await pool.query(
      `SELECT id, name, team_id
       FROM canvases
       WHERE team_id = ? AND name = ?
       LIMIT 1`,
      [teamId, name]
    );

    return rows.length ? rows[0] : null;
  },

  async createCanvas({ teamId, name, createdBy }) {
    const [res] = await pool.query(
      `INSERT INTO canvases (team_id, name, state_json, created_by)
       VALUES (?, ?, '[]', ?)`,
      [teamId, name, createdBy]
    );
    return res.insertId;
  },

  async getCanvasById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM canvases WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async getCanvasesForTeam(teamId) {
    const [rows] = await pool.query(
      `SELECT * FROM canvases
       WHERE team_id = ?
       ORDER BY updated_at DESC`,
      [teamId]
    );
    return rows;
  },

  async saveState(id, stateArray) {
    const json = JSON.stringify(stateArray);
    await pool.query(
      `UPDATE canvases
       SET state_json = ?
       WHERE id = ?`,
      [json, id]
    );
  },

  async getState(id) {
    const canvas = await this.getCanvasById(id);
    if (!canvas || !canvas.state_json) return [];
    try {
      return JSON.parse(canvas.state_json);
    } catch (e) {
      return [];
    }
  },

  async clearCanvas(id) {
    await this.saveState(id, []);
  }
};
