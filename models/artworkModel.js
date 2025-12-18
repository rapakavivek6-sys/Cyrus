const pool = require('../db/index');

module.exports = {
  async getAllArtworks() {
    const [rows] = await pool.query(
      `SELECT a.*, u.display_name AS artist_name
       FROM artworks a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );
    return rows;
  },

  async getArtworkById(id) {
    const [rows] = await pool.query(
      `SELECT a.*, u.display_name AS artist_name
       FROM artworks a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  // ✅ UPDATED: also saves canvas_id + state_json
  async createArtwork({ title, description, imageUrl, userId, canvasId, stateJson }) {
    const [result] = await pool.query(
      `INSERT INTO artworks (title, description, image_url, created_by, canvas_id, state_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, imageUrl, userId, canvasId || null, stateJson || null]
    );
    return result.insertId;
  },

  // ✅ NEW: update existing artwork (used by Edit Artwork page)
  async updateArtwork(id, { title, description, imageUrl, stateJson }) {
    await pool.query(
      `UPDATE artworks
       SET title = ?, description = ?, image_url = ?, state_json = ?
       WHERE id = ?`,
      [title, description, imageUrl, stateJson, id]
    );
  }
};
