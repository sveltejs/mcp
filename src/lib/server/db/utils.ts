import { sql, Column } from 'drizzle-orm';
import { customType } from 'drizzle-orm/sqlite-core';

/**
 * Helper function to convert an array of embeddings into a format that can be inserted into a LibSQL vector column.
 * @param arr The embeddings array.
 */
export function vector(arr: number[]) {
	return sql`vector32(${JSON.stringify(arr)})`;
}

/**
 * Helper function to calculate the distance between a vector column and an array of embeddings and return it as a columns.
 * @param column The drizzle column representing the vector.
 * @param arr The embeddings array.
 * @param as The name of the returned column. Default is 'distance'.
 *
 * @example
 * await db.select({
 *   id: vector_table.id,
 *   text: vector_table.text,
 *   distance: distance(vector_table.vector, await get_embeddings(sentence)),
 * })
 * .from(vector_table)
 * .orderBy(sql`distance`)
 * .execute();
 */
export function distance(column: Column, arr: number[], as = 'distance') {
	return sql<number>`CASE ${column} ISNULL WHEN 1 THEN 1 ELSE vector_distance_cos(${column}, vector32(${JSON.stringify(arr)})) END`.as(
		as,
	);
}

/**
 * Custom drizzle type to use the LibSQL vector column type.
 */
export const float_32_array = customType<{
	data: number[];
	config: { dimensions: number };
	configRequired: true;
	driverData: Buffer;
}>({
	dataType(config) {
		return `F32_BLOB(${config.dimensions})`;
	},
	fromDriver(value: Buffer) {
		return Array.from(new Float32Array(value.buffer));
	},
	toDriver(value: number[]) {
		return vector(value);
	},
});
