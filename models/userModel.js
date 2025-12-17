const pool = require('../config/db');

module.exports = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async createUser({ username, email, passwordHash, displayName }) {
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES (?, ?, ?, ?)`,
      [username, email, passwordHash, displayName]
    );
    return result.insertId;
  },

  async updateProfile(id, { display_name, bio }) {
    await pool.query(
      `UPDATE users SET display_name = ?, bio = ? WHERE id = ?`,
      [display_name, bio, id]
    );
  }
};
