import pg from 'pg';

const pool = new pg.Pool({
  connectionString: import.meta.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default pool;
