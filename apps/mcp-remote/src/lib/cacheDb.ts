import { db } from '$lib/server/db';
import { cache } from '$lib/server/db/schema';
import { and, eq, sql } from 'drizzle-orm';

export interface CacheEntry {
	id: number;
	cache_key: string;
	data: Buffer;
	size_bytes: number;
	expires_at: Date;
	created_at: Date;
}

export class CacheDbService {
	private defaultTTL: number;

	constructor(defaultTTLMinutes: number = 60) {
		this.defaultTTL = defaultTTLMinutes;
	}

	async get(key: string): Promise<Buffer | null> {
		try {
			const result = await db
				.select({ data: cache.data })
				.from(cache)
				.where(and(eq(cache.cache_key, key), sql`${cache.expires_at} > ${new Date()}`))
				.limit(1);

			if (result.length === 0) {
				return null;
			}

			return result[0].data;
		} catch (error) {
			console.error('Error getting cache entry:', error);
			return null;
		}
	}

	async set(key: string, data: Buffer, ttlMinutes?: number): Promise<void> {
		const ttl = ttlMinutes || this.defaultTTL;
		const expires_at = new Date(Date.now() + ttl * 60 * 1000);
		const now = new Date();

		try {
			await db
				.insert(cache)
				.values({
					cache_key: key,
					data,
					size_bytes: data.length,
					expires_at,
					created_at: now,
					updated_at: now,
				})
				.onConflictDoUpdate({
					target: cache.cache_key,
					set: {
						data,
						size_bytes: data.length,
						expires_at,
						updated_at: now,
					},
				});
		} catch (error) {
			console.error('Error setting cache entry:', error);
			throw error;
		}
	}

	async delete(key: string): Promise<boolean> {
		try {
			const result = await db.delete(cache).where(eq(cache.cache_key, key));
			return result.rowsAffected > 0;
		} catch (error) {
			console.error('Error deleting cache entry:', error);
			return false;
		}
	}

	async clear(): Promise<void> {
		try {
			await db.delete(cache);
		} catch (error) {
			console.error('Error clearing cache:', error);
			throw error;
		}
	}

	async deleteExpired(): Promise<number> {
		try {
			const result = await db.delete(cache).where(sql`${cache.expires_at} <= ${new Date()}`);
			return result.rowsAffected;
		} catch (error) {
			console.error('Error deleting expired cache entries:', error);
			return 0;
		}
	}

	async getStatus(): Promise<{ count: number; keys: string[]; totalSizeBytes: number }> {
		try {
			const result = await db
				.select({
					cache_key: cache.cache_key,
					size_bytes: cache.size_bytes,
				})
				.from(cache)
				.where(sql`${cache.expires_at} > ${new Date()}`)
				.orderBy(cache.created_at);

			const keys = result.map((row) => row.cache_key);
			const totalSizeBytes = result.reduce((sum, row) => sum + row.size_bytes, 0);

			return {
				count: result.length,
				keys,
				totalSizeBytes,
			};
		} catch (error) {
			console.error('Error getting cache status:', error);
			return { count: 0, keys: [], totalSizeBytes: 0 };
		}
	}

	async has(key: string): Promise<boolean> {
		try {
			const result = await db
				.select({ exists: sql`1` })
				.from(cache)
				.where(and(eq(cache.cache_key, key), sql`${cache.expires_at} > ${new Date()}`))
				.limit(1);
			return result.length > 0;
		} catch (error) {
			console.error('Error checking cache entry:', error);
			return false;
		}
	}
}
