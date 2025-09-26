import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';
import { getSections, fetchWithTimeout } from '../../utils.js';

export function get_documentation(server: SvelteMcp) {
	server.tool(
		{
			name: 'get-documentation',
			enabled: () => true,
			description:
				'Retrieves full documentation content for Svelte 5 or SvelteKit sections. Supports flexible search by title (e.g., "$state", "routing") or file path (e.g., "docs/svelte/state.md"). Can accept a single section name or an array of sections. Before running this, make sure to analyze the users query, as well as the output from list-sections (which should be called first). Then ask for ALL relevant sections the user might require. For example, if the user asks to build anything interactive, you will need to fetch all relevant runes, and so on.',
			schema: v.object({
				section: v.pipe(
					v.union([v.string(), v.array(v.string())]),
					v.description(
						'The section name(s) to retrieve. Can search by title (e.g., "$state", "load functions") or file path (e.g., "docs/svelte/state.md"). Supports single string and array of strings',
					),
				),
			}),
		},
		async ({ section }) => {
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

			const availableSections = await getSections();

			const results = await Promise.all(
				sections.map(async (requestedSection) => {
					const matchedSection = availableSections.find(
						s => s.title.toLowerCase() === requestedSection.toLowerCase() ||
						     s.url === requestedSection
					);

					if (matchedSection) {
						try {
							const response = await fetchWithTimeout(matchedSection.url);
							if (response.ok) {
								const content = await response.text();
								return `## ${matchedSection.title}\n\n${content}`;
							} else {
								return `## ${matchedSection.title}\n\nError: Could not fetch documentation (HTTP ${response.status})`;
							}
						} catch (error) {
							return `## ${matchedSection.title}\n\nError: Failed to fetch documentation - ${error}`;
						}
					} else {
						const formattedSections = availableSections
							.map(
								(section) =>
									`* title: ${section.title}, use_cases: ${section.use_cases}, path: ${section.url}`,
							)
							.join('\n');

						const introText = 'List of available Svelte documentation sections and its inteneded uses:';

						const outroText =
							'Use the title or path with the get-documentation tool to get more details about a specific section.';

						return `## ${requestedSection}\n\nError: Section not found.\n\n${introText}\n\n${formattedSections}\n\n${outroText}`;
					}
				})
			);

			return {
				content: [
					{
						type: 'text',
						text: results.join('\n\n---\n\n'),
					},
				],
			};
		},
	);
}
