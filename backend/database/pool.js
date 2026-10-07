const mysql = require('mysql2/promise')
const config = require('./config')

// Create a connection pool for efficient, promise-based MySQL access
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

module.exports = pool
