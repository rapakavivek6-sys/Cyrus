const pool = require('../db/index');

module.exports = {
  async dashboard(req, res) {
    const [[userCount]] = await pool.query('SELECT COUNT(*) AS c FROM users');
    const [[artworkCount]] = await pool.query('SELECT COUNT(*) AS c FROM artworks');

    res.render('admin/dashboard', {
      title: 'Admin - CYRUS',
      userCount: userCount.c,
      artworkCount: artworkCount.c
    });
  }
};
