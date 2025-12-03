const db = require("../config/db");

const Artwork = {
  async findAll({ tag } = {}) {
    let sql = `
      SELECT a.*, u.handle, u.name 
      FROM artworks a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `;
    const params = [];

    if (tag) {
      sql = `
        SELECT a.*, u.handle, u.name 
        FROM artworks a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.tag = ?
        ORDER BY a.created_at DESC
      `;
      params.push(tag);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  },

  async findByUser(userId) {
    const [rows] = await db.query(
      `
        SELECT * FROM artworks 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      [userId]
    );
    return rows;
  },

  async create({
    title,
    description,
    image_url,
    tag,
    pixels_count,
    contributors_count,
    user_id,
  }) {
    const [result] = await db.query(
      `
        INSERT INTO artworks 
        (title, description, image_url, tag, pixels_count, contributors_count, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        image_url,
        tag,
        pixels_count || 0,
        contributors_count || 1,
        user_id,
      ]
    );
    return result.insertId;
  },
};

module.exports = Artwork;
