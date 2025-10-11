import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import distilledData from '@sveltejs/mcp-server/distilled.json';
import useCasesData from '@sveltejs/mcp-server/use-cases.json';

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

	const data = (type === 'use_cases' ? useCasesData : distilledData) as SummaryData;

	// Transform into array for easier rendering
	const sections = Object.keys(data.summaries).map((slug) => {
		const summary = data.summaries[slug] || '';
		const content = data.content[slug] || '';
		const original_length = content.length;
		const distilled_length = summary.length;
		const space_savings =
			original_length > 0 ? ((original_length - distilled_length) / original_length) * 100 : 0;

		return {
			slug,
			summary,
			content,
			original_length,
			distilled_length,
			space_savings,
		};
	});

	// Calculate total space savings
	const total_original_length = sections.reduce((sum, s) => sum + s.original_length, 0);
	const total_distilled_length = sections.reduce((sum, s) => sum + s.distilled_length, 0);
	const total_space_savings =
		total_original_length > 0
			? ((total_original_length - total_distilled_length) / total_original_length) * 100
			: 0;

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
			total_original_length,
			total_distilled_length,
			total_space_savings,
		},
		sections,
	};
};
