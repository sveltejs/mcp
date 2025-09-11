import { VOYAGE_API_KEY } from '$env/static/private';
import { db } from '$lib/server/db/index.js';
import { vector_table } from '$lib/server/db/schema.js';
import { distance, vector } from '$lib/server/db/utils.js';
import { sql } from 'drizzle-orm';

async function get_embeddings(text: string) {
	const result = await fetch('https://api.voyageai.com/v1/embeddings', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${VOYAGE_API_KEY}`,
		},
		body: JSON.stringify({
			input: [text],
			model: 'voyage-3.5',
		}),
	}).then((res) => res.json());

	return result.data[0].embedding as number[];
}

export async function load({ url: { searchParams } }) {
	const sentence = searchParams.get('sentence');
	if (!sentence) return { top: [], sentence: '' };
	const top = await db
		.select({
			id: vector_table.id,
			text: vector_table.text,
			distance: distance(vector_table.vector, await get_embeddings(sentence)),
		})
		.from(vector_table)
		.orderBy(sql`distance`)
		.execute();
	return { top, sentence };
}

export const actions = {
	async default({ request }) {
		const data = await request.formData();
		const text = data.get('text')?.toString();
		const embeddings = await get_embeddings(text ?? '');
		if (text && embeddings) {
			await db
				.insert(vector_table)
				.values({ text, vector: vector(embeddings) })
				.execute();
		}
	},
};
