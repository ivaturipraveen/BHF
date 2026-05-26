import { Pool, PoolClient, type PoolConfig } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
};

declare global {
  // eslint-disable-next-line no-var
  var __bhfPgPool: Pool | undefined;
}

function createPool(): Pool {
  const pool = new Pool(poolConfig);
  pool.on('error', (err) => {
    console.error('[db] idle client error', err);
  });
  return pool;
}

export const pool: Pool =
  process.env.NODE_ENV === 'production'
    ? createPool()
    : (globalThis.__bhfPgPool ??= createPool());

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(sql, params);
  return res.rows as T[];
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
