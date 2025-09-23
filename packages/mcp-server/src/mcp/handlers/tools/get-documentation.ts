import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';

export function get_documentation(server: SvelteMcp) {
	server.tool(
		{
			name: 'get-documentation',
			description:
				'Retrieves full documentation content for Svelte 5 or SvelteKit sections. Supports flexible search by title (e.g., "$state", "routing") or file path (e.g., "docs/svelte/state.md"). Can accept a single section name or an array of sections. Before running this, make sure to analyze the users query, as well as the output from list_sections (which should be called first). Then ask for ALL relevant sections the user might require. For example, if the user asks to build anything interactive, you will need to fetch all relevant runes, and so on.',
			schema: v.object({
				section: v.pipe(
					v.union([v.string(), v.array(v.string())]),
					v.description(
						'The section name(s) to retrieve. Can search by title (e.g., "$state", "load functions") or file path (e.g., "docs/svelte/state.md"). Supports single string and array of strings',
					),
				),
			}),
		},
		({ section }) => {
			let sections: string[];

			if (Array.isArray(section)) {
				sections = section.filter((s): s is string => typeof s === 'string');
			} else if (
				typeof section === 'string' &&
				section.trim().startsWith('[') &&
				section.trim().endsWith(']')
			) {
				try {
					const parsed = JSON.parse(section);
					if (Array.isArray(parsed)) {
						sections = parsed.filter((s): s is string => typeof s === 'string');
					} else {
						sections = [section];
					}
				} catch {
					sections = [section];
				}
			} else if (typeof section === 'string') {
				sections = [section];
			} else {
				sections = [];
			}

			const sections_list = sections.length > 0 ? sections.join(', ') : 'no sections';

			return {
				content: [
					{
						type: 'text',
						text: `called for sections: ${sections_list}`,
					},
				],
			};
		},
	);
}
