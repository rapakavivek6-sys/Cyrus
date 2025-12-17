const pool = require('../db/index');


module.exports = {
  async createTeam(name, ownerId) {
    const [result] = await pool.query(
      `INSERT INTO teams (name, created_by)
       VALUES (?, ?)`,
      [name, ownerId]
    );
    const teamId = result.insertId;

    await pool.query(
      `INSERT INTO team_memberships (user_id, team_id, role)
       VALUES (?, ?, 'owner')`,
      [ownerId, teamId]
    );

    return teamId;
  },

  async addMember(teamId, userId, role = 'member') {
    await pool.query(
      `INSERT INTO team_memberships (user_id, team_id, role)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE role = VALUES(role)`,
      [userId, teamId, role]
    );
  },

  async getTeamsForUser(userId) {
    const [rows] = await pool.query(
      `SELECT t.*, tm.role
         FROM team_memberships tm
         JOIN teams t ON tm.team_id = t.id
        WHERE tm.user_id = ?`,
      [userId]
    );
    return rows;
  },

  async userInTeam(userId, teamId) {
    const [rows] = await pool.query(
      `SELECT * FROM team_memberships
        WHERE user_id = ? AND team_id = ?`,
      [userId, teamId]
    );
    return rows[0] || null;
  }
};
