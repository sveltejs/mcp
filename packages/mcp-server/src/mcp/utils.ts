import * as v from 'valibot';
import { documentation_sections_schema } from '../mcp/schemas/index.js';
import summaryData from '../use_cases.json' with { type: 'json' };

export async function fetch_with_timeout(
	url: string,
	timeout_ms: number = 10000,
): Promise<Response> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(timeout_ms) });
		return response;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error(`Request timed out after ${timeout_ms}ms`);
		}
		throw error;
	}
}

const summaries = (summaryData.summaries || {}) as Record<string, string>;

export async function get_sections() {
	const sections = await fetch_with_timeout(
		'https://svelte.dev/docs/experimental/sections.json',
	).then((res) => res.json());
	const validated_sections = v.safeParse(documentation_sections_schema, sections);
	if (!validated_sections.success) return [];
	return Object.entries(validated_sections.output).map(([, section]) => ({
		title: section.metadata.title,
		use_cases: section.metadata.use_cases ?? summaries[section.slug] ?? '',
		slug: section.slug,
		url: `https://svelte.dev/${section.slug}/llms.txt`,
	}));
}

export async function format_sections_list(): Promise<string> {
	const sections = await get_sections();
	return sections
		.map((s) => `* title: ${s.title}, use_cases: ${s.use_cases}, path: ${s.url}`)
		.join('\n');
}
