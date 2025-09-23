import type { SvelteMcp } from '../../index.js';

export function list_sections(server: SvelteMcp) {
	server.resource(
		{
			name: 'list-sections',
			description:
				'The list of all the available Svelte 5 and SvelteKit documentation sections in a structured format.',
			uri: 'svelte://list-sections',
			title: 'Svelte Documentation Section',
		},
		async (uri) => {
			return {
				contents: [
					{
						uri,
						type: 'text',
						text: 'resource list-sections called',
					},
				],
			};
		},
	);
}
