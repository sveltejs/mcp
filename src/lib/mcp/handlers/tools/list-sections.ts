import type { SvelteMcp } from '../../index.js';

export function list_sections(server: SvelteMcp) {
	server.tool(
		{
			name: 'list_sections',
			description:
				'Lists all available Svelte 5 and SvelteKit documentation sections in a structured format. Returns sections as a list of "* title: [section_title], path: [file_path]" - you can use either the title or path when querying a specific section via the get_documentation tool. Always run list_sections first for any query related to Svelte development to discover available content.',
		},
		() => {
			return {
				content: [
					{
						type: 'text',
						text: 'tool list_sections called',
					},
				],
			};
		},
	);
}
