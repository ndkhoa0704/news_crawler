import pg from 'pg';
import config from "../config.js";

function PostgresDB() {
    const self = {
        pool: null,
    }

    const db = {
        execute_sql: async (sql, binds) => {
            if (!self.pool)
                return Promise.reject("Database not connected");
            const client = await self.pool.connect();
            let result;
            await client.query('BEGIN')
            try {
                result = await client.query(sql, binds);
                await client.query('COMMIT')
                client.release()
            } catch (e) {
                await client.query('ROLLBACK')
                client.release()
                return Promise.reject(e);
            }
            if (result && result.rows) {
                return result.rows;
            } else {
                return result;
            }
        },
        connect: async () => {
            if (self.pool) return self.pool;
            const pool = new pg.Pool(config.POSTGRES);
            const client = await pool.connect();
            client.release();
            self.pool = pool;
        },
        disconnect: async () => {
            if (self.pool) {
                await self.pool.end();
                self.pool = null;
            }
        },
    };

    return db;
}

export default PostgresDB();