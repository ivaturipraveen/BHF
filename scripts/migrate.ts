import { runner } from 'node-pg-migrate';
import path from 'node:path';

async function main(): Promise<void> {
  const direction = (process.argv[2] === 'down' ? 'down' : 'up') as 'up' | 'down';

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const result = await runner({
    databaseUrl: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    dir: path.resolve(process.cwd(), 'migrations'),
    migrationsTable: 'pg_migrations',
    migrationsSchema: 'bw_bhf_38',
    schema: 'bw_bhf_38',
    direction,
    count: direction === 'up' ? Infinity : 1,
    verbose: true,
    singleTransaction: true,
    checkOrder: true,
  });

  console.log(`\n[migrate] ${direction} applied:`, result.map((m) => m.name));
}

main().catch((err) => {
  console.error('[migrate] failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
