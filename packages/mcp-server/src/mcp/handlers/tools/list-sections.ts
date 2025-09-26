import type { SvelteMcp } from '../../index.js';
import { get_sections } from '../../utils.js';

export function list_sections(server: SvelteMcp) {
	server.tool(
		{
			name: 'list-sections',
			enabled: () => true,
			description:
				'Lists all available Svelte 5 and SvelteKit documentation sections in a structured format. Returns sections as a list of "* title: [section_title], use_cases: [use_cases], path: [file_path]" - you can use either the title or path when querying a specific section via the get_documentation tool. Always run list-sections first for any query related to Svelte development to discover available content.',
		},
		async () => {
			const sections = await get_sections();
			const formatted_sections = sections
				.map(
					(section) =>
						`* title: ${section.title}, use_cases: ${section.use_cases}, path: ${section.url}`,
				)
				.join('\n');

			const intro_text = 'List of available Svelte documentation sections and its inteneded uses:';

			const outro_text =
				'Use the title or path with the get-documentation tool to get more details about a specific section.';

			return {
				content: [
					{
						type: 'text',
						text: `${intro_text}\n\n${formatted_sections}\n\n${outro_text}`,
					},
				],
			};
		},
	);
}
