const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool. This is more efficient than creating a new connection
// for every single query. The pool manages a set of connections that can be
// reused, which improves performance.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0,
});

console.log('MySQL Connection Pool Created.');

// Export the pool so it can be used in other parts of the application
module.exports = pool;