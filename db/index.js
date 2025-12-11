// db/index.js
const mysql = require('mysql2/promise');

// Create a connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',            // Docker service name
  user: process.env.DB_USER || 'cyrus_user',    // from docker-compose.yml
  password: process.env.DB_PASSWORD || 'cyrus_pass',
  database: process.env.DB_NAME || 'cyrus_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export pooled connection
module.exports = pool;
