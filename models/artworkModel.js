const pool = require('../config/db');

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

  async createArtwork({ title, description, imageUrl, userId }) {
    const [result] = await pool.query(
      `INSERT INTO artworks (title, description, image_url, created_by)
       VALUES (?, ?, ?, ?)`,
      [title, description, imageUrl, userId]
    );
    return result.insertId;
  }
};
