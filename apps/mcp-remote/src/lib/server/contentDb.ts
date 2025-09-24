import { query } from '$lib/server/db';
import type {
	DbContent,
	DbContentDistilled,
	CreateContentInput,
	ContentFilter,
	ContentStats,
} from '$lib/types/db';
import { logAlways, logErrorAlways } from '$lib/log';

// Type mapping for table names to their corresponding types
type TableTypeMap = {
	content: DbContent;
	content_distilled: DbContentDistilled;
};

// Union type for valid table names
type TableName = keyof TableTypeMap;

export class ContentDbService {
	static extractFilename(path: string): string {
		return path.split('/').pop() || path;
	}

	static async upsertContent(input: CreateContentInput): Promise<DbContent> {
		try {
			const result = await query(
				`INSERT INTO content (
					path, filename, content, size_bytes, metadata
				) VALUES ($1, $2, $3, $4, $5)
				ON CONFLICT (path) DO UPDATE SET
					content = EXCLUDED.content,
					size_bytes = EXCLUDED.size_bytes,
					metadata = EXCLUDED.metadata,
					updated_at = CURRENT_TIMESTAMP
				RETURNING *`,
				[
					input.path,
					input.filename,
					input.content,
					input.size_bytes,
					input.metadata ? JSON.stringify(input.metadata) : '{}',
				],
			);

			logAlways(`Upserted content for ${input.path}`);
			return result.rows[0] as DbContent;
		} catch (error) {
			logErrorAlways(`Failed to upsert content for ${input.path}:`, error);
			throw new Error(
				`Failed to upsert content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async getContentByPath(path: string): Promise<DbContent | null> {
		try {
			const result = await query('SELECT * FROM content WHERE path = $1', [path]);
			return result.rows.length > 0 ? (result.rows[0] as DbContent) : null;
		} catch (error) {
			logErrorAlways(`Failed to get content ${path}:`, error);
			throw new Error(
				`Failed to get content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async getAllContent(): Promise<DbContent[]> {
		try {
			const result = await query('SELECT * FROM content ORDER BY path');
			return result.rows as DbContent[];
		} catch (error) {
			logErrorAlways('Failed to get all content:', error);
			throw new Error(
				`Failed to get content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Generic search method that works with both content and content_distilled tables
	 */
	static async searchContent<T extends TableName>(
		searchQuery: string,
		tableName: T,
		pathPattern: string = 'apps/svelte.dev/content/docs/%',
	): Promise<TableTypeMap[T] | null> {
		try {
			const lowerQuery = searchQuery.toLowerCase();

			// Build table-specific WHERE clauses
			let baseWhereClause = '';
			let params: (string | number)[] = [];
			let paramIndex = 1;

			if (tableName === 'content') {
				// For content table, include path filter
				baseWhereClause = `WHERE path LIKE $${paramIndex}`;
				params = [pathPattern];
				paramIndex = 2;
			} else {
				// For content_distilled table, no additional filters needed
				baseWhereClause = '';
				paramIndex = 1;
			}

			// First, try exact title match using JSON operators
			const exactTitleQueryStr = `
				SELECT * FROM ${tableName} 
				${baseWhereClause}${baseWhereClause ? ' AND' : 'WHERE'} LOWER(metadata->>'title') = $${paramIndex}
				LIMIT 1
			`;

			const exactTitleParams = [...params, lowerQuery];
			const exactTitleResult = await query(exactTitleQueryStr, exactTitleParams);

			if (exactTitleResult.rows.length > 0) {
				return exactTitleResult.rows[0] as TableTypeMap[T];
			}

			// Then try partial title match
			const partialTitleQueryStr = `
				SELECT * FROM ${tableName} 
				${baseWhereClause}${baseWhereClause ? ' AND' : 'WHERE'} LOWER(metadata->>'title') LIKE $${paramIndex}
				LIMIT 1
			`;

			const partialTitleParams = [...params, `%${lowerQuery}%`];
			const partialTitleResult = await query(partialTitleQueryStr, partialTitleParams);

			if (partialTitleResult.rows.length > 0) {
				return partialTitleResult.rows[0] as TableTypeMap[T];
			}

			// Finally try path match for backward compatibility
			const pathMatchQueryStr = `
				SELECT * FROM ${tableName} 
				${baseWhereClause}${baseWhereClause ? ' AND' : 'WHERE'} LOWER(path) LIKE $${paramIndex}
				LIMIT 1
			`;

			const pathMatchParams = [...params, `%${lowerQuery}%`];
			const pathMatchResult = await query(pathMatchQueryStr, pathMatchParams);

			return pathMatchResult.rows.length > 0 ? (pathMatchResult.rows[0] as TableTypeMap[T]) : null;
		} catch (error) {
			logErrorAlways(`Failed to search ${tableName} for "${searchQuery}":`, error);
			throw new Error(
				`Failed to search ${tableName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async searchAllContent(
		searchQuery: string,
		pathPattern: string = 'apps/svelte.dev/content/docs/%',
		limit: number = 50,
	): Promise<DbContent[]> {
		try {
			const lowerQuery = searchQuery.toLowerCase();

			// Combine all search types into one query with UNION
			const combinedQueryStr = `
				-- Exact title matches first
				(SELECT * FROM content 
				WHERE path LIKE $1
					AND LOWER(metadata->>'title') = $2
				ORDER BY path
				LIMIT $3)
				
				UNION
				
				-- Then partial title matches
				(SELECT * FROM content 
				WHERE path LIKE $1
					AND LOWER(metadata->>'title') LIKE $4
					AND LOWER(metadata->>'title') != $2
				ORDER BY path
				LIMIT $3)
				
				UNION
				
				-- Finally path matches
				(SELECT * FROM content 
				WHERE path LIKE $1
					AND LOWER(path) LIKE $4
					AND (metadata->>'title' IS NULL OR LOWER(metadata->>'title') NOT LIKE $4)
				ORDER BY path
				LIMIT $3)
				
				ORDER BY path
				LIMIT $3
			`;

			const params = [pathPattern, lowerQuery, limit, `%${lowerQuery}%`];

			const result = await query(combinedQueryStr, params);

			return result.rows as DbContent[];
		} catch (error) {
			logErrorAlways(`Failed to search all content for "${searchQuery}":`, error);
			throw new Error(
				`Failed to search content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async getDocumentationSections(
		pathPattern: string = 'apps/svelte.dev/content/docs/%',
		minContentLength: number = 100,
	): Promise<Array<{ path: string; metadata: Record<string, unknown>; content: string }>> {
		try {
			const sectionsQueryStr = `
				SELECT path, metadata, content
				FROM content 
				WHERE path LIKE $1
					AND LENGTH(content) >= $2
				ORDER BY path
			`;

			const params = [pathPattern, minContentLength];

			const result = await query(sectionsQueryStr, params);

			return result.rows.map((row) => ({
				path: row.path,
				metadata: row.metadata,
				content: row.content,
			}));
		} catch (error) {
			logErrorAlways('Failed to get documentation sections:', error);
			throw new Error(
				`Failed to get sections: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async getFilteredContent(
		pathPattern: string = 'apps/svelte.dev/content/docs/%',
		minContentLength: number = 200,
	): Promise<DbContent[]> {
		try {
			const filterQueryStr = `
				SELECT *
				FROM content 
				WHERE path LIKE $1
					AND LENGTH(content) >= $2
				ORDER BY path
			`;

			const params = [pathPattern, minContentLength];

			const result = await query(filterQueryStr, params);
			return result.rows as DbContent[];
		} catch (error) {
			logErrorAlways('Failed to get filtered content:', error);
			throw new Error(
				`Failed to get filtered content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async getContentStats(): Promise<ContentStats> {
		try {
			const totalResult = await query(
				`SELECT 
					COUNT(*) as total_files,
					COALESCE(SUM(size_bytes), 0) as total_size_bytes,
					MAX(updated_at) as last_updated
				FROM content`,
			);

			return {
				total_files: parseInt(totalResult.rows[0].total_files),
				total_size_bytes: parseInt(totalResult.rows[0].total_size_bytes),
				last_updated: totalResult.rows[0].last_updated,
			};
		} catch (error) {
			logErrorAlways('Failed to get content stats:', error);
			throw new Error(
				`Failed to get stats: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async deleteContent(path: string): Promise<boolean> {
		try {
			const result = await query('DELETE FROM content WHERE path = $1', [path]);
			return (result.rowCount ?? 0) > 0;
		} catch (error) {
			logErrorAlways(`Failed to delete content ${path}:`, error);
			throw new Error(
				`Failed to delete content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async deleteAllContent(): Promise<number> {
		try {
			const result = await query('DELETE FROM content');
			return result.rowCount ?? 0;
		} catch (error) {
			logErrorAlways('Failed to delete all content:', error);
			throw new Error(
				`Failed to delete content: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static async hasContentChanged(path: string, newContent: string): Promise<boolean> {
		try {
			const existing = await ContentDbService.getContentByPath(path);
			if (!existing) return true;

			return existing.content !== newContent;
		} catch (error) {
			logErrorAlways(`Failed to check content change for ${path}:`, error);
			return true; // Assume changed on error
		}
	}

	static async batchUpsertContent(contents: CreateContentInput[]): Promise<DbContent[]> {
		try {
			const results: DbContent[] = [];

			// Process in chunks to avoid overwhelming the database
			const chunkSize = 200;
			for (let i = 0; i < contents.length; i += chunkSize) {
				const chunk = contents.slice(i, i + chunkSize);

				const chunkResults = await Promise.all(
					chunk.map((content) => ContentDbService.upsertContent(content)),
				);

				results.push(...chunkResults);
			}

			logAlways(`Batch upserted ${results.length} content items`);
			return results;
		} catch (error) {
			logErrorAlways('Failed to batch upsert content:', error);
			throw new Error(
				`Failed to batch upsert: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	static extractFrontmatter(content: string): Record<string, unknown> {
		const metadata: Record<string, unknown> = {};

		if (!content.startsWith('---\n')) {
			return metadata;
		}

		const endIndex = content.indexOf('\n---\n', 4);
		if (endIndex === -1) {
			return metadata;
		}

		const frontmatter = content.substring(4, endIndex);
		const lines = frontmatter.split('\n');

		for (const line of lines) {
			const colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				const key = line.substring(0, colonIndex).trim();
				const value = line.substring(colonIndex + 1).trim();

				// Remove quotes if present
				const cleanValue = value.replace(/^["'](.*)["']$/, '$1');

				// Try to parse as JSON for nested structures
				try {
					metadata[key] = JSON.parse(cleanValue);
				} catch {
					metadata[key] = cleanValue;
				}
			}
		}

		return metadata;
	}
}
