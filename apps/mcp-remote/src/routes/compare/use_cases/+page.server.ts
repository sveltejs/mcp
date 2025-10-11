import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { PageServerLoad } from './$types';

interface SummaryData {
	generated_at: string;
	model: string;
	total_sections: number;
	successful_summaries: number;
	summaries: Record<string, string>;
	content: Record<string, string>;
}

export const load: PageServerLoad = async () => {
	const json_path = join(process.cwd(), '../../packages/mcp-server/src/use_cases.json');
	const file_content = await readFile(json_path, 'utf-8');
	const data = JSON.parse(file_content) as SummaryData;

	// Transform into array for easier rendering
	const sections = Object.keys(data.summaries).map((slug) => ({
		slug,
		summary: data.summaries[slug] || '',
		content: data.content[slug] || '',
	}));

	return {
		metadata: {
			generated_at: data.generated_at,
			model: data.model,
			total_sections: data.total_sections,
			successful_summaries: data.successful_summaries,
		},
		sections,
	};
};
