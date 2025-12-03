const db = require("../db");

async function findByEmail(email) {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash, handle, bio }) {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password_hash, handle, bio) VALUES (?, ?, ?, ?, ?)",
    [name, email, passwordHash, handle, bio || ""]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  createUser
};
