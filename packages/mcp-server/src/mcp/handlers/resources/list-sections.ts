import type { SvelteMcp } from '../../index.js';
import { get_sections, fetch_with_timeout } from '../../utils.js';

export async function list_sections(server: SvelteMcp) {
	const sections = await get_sections();

	sections.forEach((section) => {
		const section_name = section.title.toLowerCase().replace(/\s+/g, '-');
		const resource_name = `docs/svelte/${section_name}`;
		const resource_uri = `svelte://docs/${section_name}`;

		server.resource(
			{
				name: resource_name,
				enabled: () => true,
				description: section.use_cases,
				uri: resource_uri,
				title: section.title,
			},
			async (uri) => {
				const response = await fetch_with_timeout(section.url);
				const content = await response.text();
				return {
					contents: [
						{
							uri,
							type: 'text',
							text: content,
						},
					],
				};
			},
		);
	});
}
