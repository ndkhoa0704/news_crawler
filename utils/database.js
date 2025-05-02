const pg = require('pg');
const config = require('../config.js');

function PostgresDB() {
    const self = {
        pool: null,
    }
    return {
        isConnected: () => {
            return self.pool !== null;
        },
        execute_sql: async (sql, binds) => {
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
            self.pool = pool;
        },
        disconnect: async () => {
            if (self.pool) {
                await self.pool.end();
                self.pool = null;
            }
        },
    };
}

module.exports = PostgresDB();