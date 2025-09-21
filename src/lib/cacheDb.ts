import { maybeInitializePool } from '$lib/server/db';
import type { Pool } from 'pg';

export interface CacheEntry {
	id: number;
	cache_key: string;
	data: Buffer;
	size_bytes: number;
	expires_at: Date;
	created_at: Date;
}

export class CacheDbService {
	private db: Pool;
	private defaultTTL: number;

	constructor(db?: Pool, defaultTTLMinutes: number = 60) {
		this.db = db || maybeInitializePool();
		this.defaultTTL = defaultTTLMinutes;
	}

	async get(key: string): Promise<Buffer | null> {
		const query = `
      SELECT data, expires_at 
      FROM cache 
      WHERE cache_key = $1 AND expires_at > NOW()
    `;

		try {
			const result = await this.db.query(query, [key]);

			if (result.rows.length === 0) {
				return null;
			}

			return result.rows[0].data;
		} catch (error) {
			console.error('Error getting cache entry:', error);
			return null;
		}
	}

	async set(key: string, data: Buffer, ttlMinutes?: number): Promise<void> {
		const ttl = ttlMinutes || this.defaultTTL;
		const query = `
      INSERT INTO cache (cache_key, data, size_bytes, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '${ttl} minutes')
      ON CONFLICT (cache_key) 
      DO UPDATE SET 
        data = EXCLUDED.data,
        size_bytes = EXCLUDED.size_bytes,
        expires_at = EXCLUDED.expires_at
    `;

		try {
			await this.db.query(query, [key, data, data.length]);
		} catch (error) {
			console.error('Error setting cache entry:', error);
			throw error;
		}
	}

	async delete(key: string): Promise<boolean> {
		const query = 'DELETE FROM cache WHERE cache_key = $1';

		try {
			const result = await this.db.query(query, [key]);
			return (result.rowCount ?? 0) > 0;
		} catch (error) {
			console.error('Error deleting cache entry:', error);
			return false;
		}
	}

	async clear(): Promise<void> {
		const query = 'DELETE FROM cache';

		try {
			await this.db.query(query);
		} catch (error) {
			console.error('Error clearing cache:', error);
			throw error;
		}
	}

	async deleteExpired(): Promise<number> {
		const query = 'DELETE FROM cache WHERE expires_at <= NOW()';

		try {
			const result = await this.db.query(query);
			return result.rowCount ?? 0;
		} catch (error) {
			console.error('Error deleting expired cache entries:', error);
			return 0;
		}
	}

	async getStatus(): Promise<{ count: number; keys: string[]; totalSizeBytes: number }> {
		const query = `
      SELECT cache_key, size_bytes 
      FROM cache 
      WHERE expires_at > NOW()
      ORDER BY created_at DESC
    `;

		try {
			const result = await this.db.query(query);
			const keys = result.rows.map((row) => row.cache_key);
			const totalSizeBytes = result.rows.reduce((sum, row) => sum + row.size_bytes, 0);

			return {
				count: result.rows.length,
				keys,
				totalSizeBytes,
			};
		} catch (error) {
			console.error('Error getting cache status:', error);
			return { count: 0, keys: [], totalSizeBytes: 0 };
		}
	}

	async has(key: string): Promise<boolean> {
		const query = 'SELECT 1 FROM cache WHERE cache_key = $1 AND expires_at > NOW()';

		try {
			const result = await this.db.query(query, [key]);
			return result.rows.length > 0;
		} catch (error) {
			console.error('Error checking cache entry:', error);
			return false;
		}
	}
}
