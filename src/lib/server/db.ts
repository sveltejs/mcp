import PG from 'pg';
import type { Pool } from 'pg';
import type { QueryResult } from 'pg';
import type { QueryConfig } from '$lib/types/db';

import { env } from '$env/dynamic/private';
import { logAlways, log, logErrorAlways } from '$lib/log';

let pool: Pool | null = null;

export function maybeInitializePool(): Pool {
	if (!pool) {
		logAlways('🐘 Initializing Postgres connection!');
		pool = new PG.Pool({
			connectionString: env.DB_URL || 'postgres://admin:admin@localhost:5432/db',
			max: parseInt(env.DB_CLIENTS || '10'),
		});
	}
	return pool;
}

export async function query(
	incomingQuery: string,
	params: unknown[] = [],
	config: QueryConfig = {},
): Promise<QueryResult> {
	const pool = maybeInitializePool();

	if (!pool) {
		throw new Error('Database connection pool is not initialized');
	}

	const timingStart = new Date();

	if (config.debug === true || env?.DB_DEBUG === 'true') {
		log('----');
		log(`🔰 Query: ${incomingQuery}`);
		log('📊 Data: ', params);
	}

	try {
		const results = await pool.query(incomingQuery, params);

		if (config.debug === true || env?.DB_DEBUG === 'true') {
			log('⏰ Postgres query execution time: %dms', new Date().getTime() - timingStart.getTime());
			log('----');
		}

		return results;
	} catch (error) {
		logErrorAlways('Database query error:', {
			query: incomingQuery,
			params,
			error: error instanceof Error ? error.message : String(error),
		});

		// Re-throw the error to let it bubble up
		throw error;
	}
}

export async function disconnect(): Promise<void> {
	if (pool !== null) {
		logAlways('😵 Disconnecting from Postgres!');
		const thisPool = pool;
		pool = null;
		return await thisPool.end();
	}

	return;
}
