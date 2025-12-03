const db = require("../config/db");

const User = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  },

  async findByHandle(handle) {
    const [rows] = await db.query("SELECT * FROM users WHERE handle = ?", [
      handle,
    ]);
    return rows[0] || null;
  },

  async create({ name, email, password_hash, handle, bio }) {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, handle, bio) VALUES (?, ?, ?, ?, ?)",
      [name, email, password_hash, handle, bio]
    );
    return result.insertId;
  },

  async updateProfile(id, { name, bio }) {
    await db.query("UPDATE users SET name = ?, bio = ? WHERE id = ?", [
      name,
      bio,
      id,
    ]);
  },
};

module.exports = User;
