const db = require("../db");

async function getAllArtworks({ tag, sort }) {
  let query = "SELECT a.*, u.handle FROM artworks a LEFT JOIN users u ON a.user_id = u.id";
  const params = [];
  const conditions = [];

  if (tag) {
    conditions.push("a.tag = ?");
    params.push(tag);
  }

  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ");
  }

  if (sort === "popular") {
    query += " ORDER BY a.pixels_count DESC";
  } else if (sort === "featured") {
    query += " ORDER BY a.contributors_count DESC";
  } else {
    query += " ORDER BY a.created_at DESC";
  }

  const [rows] = await db.query(query, params);
  return rows;
}

async function getArtworkById(id) {
  const [rows] = await db.query(
    "SELECT a.*, u.handle FROM artworks a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?",
    [id]
  );
  return rows[0] || null;
}

async function getArtworksByUser(userId) {
  const [rows] = await db.query(
    "SELECT * FROM artworks WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

async function createArtwork({ title, description, imageUrl, tag, pixelsCount, contributorsCount, userId }) {
  const [result] = await db.query(
    "INSERT INTO artworks (title, description, image_url, tag, pixels_count, contributors_count, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      title,
      description || "",
      imageUrl || "/images/sample-art-1.jpg",
      tag || "event",
      pixelsCount || 0,
      contributorsCount || 1,
      userId || null
    ]
  );
  return result.insertId;
}

module.exports = {
  getAllArtworks,
  getArtworkById,
  getArtworksByUser,
  createArtwork
};
