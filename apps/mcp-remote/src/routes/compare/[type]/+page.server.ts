import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface SummaryData {
	generated_at: string;
	model: string;
	total_sections: number;
	successful_summaries: number;
	summaries: Record<string, string>;
	content: Record<string, string>;
}

const VALID_TYPES = ['use_cases', 'distilled'] as const;
type ValidType = (typeof VALID_TYPES)[number];

function is_valid_type(type: string): type is ValidType {
	return VALID_TYPES.includes(type as ValidType);
}

export const load: PageServerLoad = async ({ params }) => {
	const { type } = params;

	if (!is_valid_type(type)) {
		throw error(404, 'Comparison type not found');
	}

	const json_path = join(process.cwd(), `../../packages/mcp-server/src/${type}.json`);

	try {
		const file_content = await readFile(json_path, 'utf-8');
		const data = JSON.parse(file_content) as SummaryData;

		// Transform into array for easier rendering
		const sections = Object.keys(data.summaries).map((slug) => ({
			slug,
			summary: data.summaries[slug] || '',
			content: data.content[slug] || '',
		}));

		// Determine the title based on type
		const title =
			type === 'use_cases' ? 'Use Cases Comparison' : 'Distilled Documentation Comparison';

		return {
			type,
			title,
			metadata: {
				generated_at: data.generated_at,
				model: data.model,
				total_sections: data.total_sections,
				successful_summaries: data.successful_summaries,
			},
			sections,
		};
	} catch (err) {
		throw error(500, `Failed to load ${type} data: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
};
