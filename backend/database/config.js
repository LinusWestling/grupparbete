const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from process.cwd() .env, backend/.env, or root .env
dotenv.config(); // Loads .env from current working directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); // backend/.env
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') }); // root .env

const caPath = path.resolve(__dirname, '..', 'ca.pem');
const hasCaFile = fs.existsSync(caPath);

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skillswap',
  ...(process.env.DB_SSL === 'true' && {
    ssl: hasCaFile ? {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true,
    } : {
      rejectUnauthorized: false,
    },
  }),
};
