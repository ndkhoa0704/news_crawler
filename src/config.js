export default {
    POSTGRES: {
        host: process.env.PG_HOSTNAME || 'localhost',
        port: process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE || 'news',
        user: process.env.PG_USERNAME || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
    }
}