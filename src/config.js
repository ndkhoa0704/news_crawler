const dotenv = require('dotenv');
const path = require('path');

// Use path.resolve to get absolute path to .env file in project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
    POSTGRES: {
        host: process.env.PG_HOSTNAME || 'localhost',
        port: process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE || 'news',
        user: process.env.PG_USERNAME || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
    }
}