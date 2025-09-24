import { blob, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { float_32_array } from './utils.js';

/**
 * NOTE: if you modify a schema adding a vector column you need to manually add this
 *
 * CREATE INDEX IF NOT EXISTS name_of_the_index
 * ON `name_of_the_table` (
 * 	libsql_vector_idx(name_of_the_column, 'metric=cosine')
 * )
 *
 * to the generated migration file
 */

export const distillations = sqliteTable('distillations', {
	id: integer('id').primaryKey(),
	preset_name: text('preset_name').notNull(),
	version: text('version').notNull(),
	content: text('content').notNull(),
	size_kb: integer('size_kb').notNull(),
	document_count: integer('document_count').notNull(),
	distillation_job_id: integer('distillation_job_id').references(() => distillation_jobs.id),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const distillation_jobs = sqliteTable('distillation_jobs', {
	id: integer('id').primaryKey(),
	preset_name: text('preset_name').notNull(),
	batch_id: text('batch_id'),
	status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull(),
	model_used: text('model_used').notNull(),
	total_files: integer('total_files').notNull(),
	processed_files: integer('processed_files').notNull().default(0),
	successful_files: integer('successful_files').notNull().default(0),
	minimize_applied: integer('minimize_applied', { mode: 'boolean' }).notNull().default(false),
	total_input_tokens: integer('total_input_tokens').notNull().default(0),
	total_output_tokens: integer('total_output_tokens').notNull().default(0),
	started_at: integer('started_at', { mode: 'timestamp' }),
	completed_at: integer('completed_at', { mode: 'timestamp' }),
	error_message: text('error_message'),
	metadata: text('metadata', { mode: 'json' }).notNull().default({}),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const content = sqliteTable('content', {
	id: integer('id').primaryKey(),
	path: text('path').notNull().unique(),
	filename: text('filename').notNull(),
	content: text('content').notNull(),
	size_bytes: integer('size_bytes').notNull(),
	embeddings: float_32_array('embeddings', { dimensions: 1024 }),
	metadata: text('metadata', { mode: 'json' }).notNull().default({}),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const content_distilled = sqliteTable('content_distilled', {
	id: integer('id').primaryKey(),
	path: text('path').notNull().unique(),
	filename: text('filename').notNull(),
	content: text('content').notNull(),
	size_bytes: integer('size_bytes').notNull(),
	embeddings: float_32_array('embeddings', { dimensions: 1024 }),
	metadata: text('metadata', { mode: 'json' }).notNull().default({}),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const cache = sqliteTable('cache', {
	id: integer('id').primaryKey(),
	cache_key: text('cache_key').notNull().unique(),
	data: blob('data', { mode: 'buffer' }).notNull(),
	size_bytes: integer('size_bytes').notNull(),
	expires_at: integer('expires_at', { mode: 'timestamp' }).notNull(),
	created_at: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updated_at: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
});
