import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { float_32_array } from './utils';

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

// this is just an example of a vector table...we can change this with the docs table later
export const vector_table = sqliteTable('vector_table', {
	id: integer('id').primaryKey(),
	text: text('text'),
	vector: float_32_array('vector', { dimensions: 3 }),
});
