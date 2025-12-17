require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'cyrus_user',
    password: process.env.DB_PASSWORD || 'cyrus_pass',
    database: process.env.DB_NAME || 'cyrus_db'
  },
  sessionSecret: process.env.SESSION_SECRET || 'super-secret-cyrus'
};
