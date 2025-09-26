import type { SvelteMcp } from '../../index.js';
import { getSections } from '../../utils.js';

export function list_sections(server: SvelteMcp) {
	server.tool(
		{
			name: 'list-sections',
			enabled: () => true,
			description:
				'Lists all available Svelte 5 and SvelteKit documentation sections in a structured format. Returns sections as a list of "* title: [section_title], path: [file_path]" - you can use either the title or path when querying a specific section via the get_documentation tool. Always run list_sections first for any query related to Svelte development to discover available content.',
		},
		() => {
			const sections = getSections();
			const formattedSections = sections
				.map(section => `* title: ${section.title}, path: ${section.url}`)
				.join('\n');

			return {
				content: [
					{
						type: 'text',
						text: formattedSections,
					},
				],
			};
		},
	);
}
