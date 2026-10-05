const mysql = require('mysql2')
const connectionMySQL = mysql.createConnection(require('./database/config'))

module.exports = connectionMySQL
