const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...(process.env.DB_SSL === 'true' && {
        ssl: {
            ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem')),
            rejectUnauthorized: true
        }
    })
};
