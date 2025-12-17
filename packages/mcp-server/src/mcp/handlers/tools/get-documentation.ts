import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';
import { get_sections, fetch_with_timeout, format_sections_list } from '../../utils.js';
import { SECTIONS_LIST_INTRO, SECTIONS_LIST_OUTRO } from './prompts.js';
import { icons } from '../../icons/index.js';
import { tool } from 'tmcp/utils';

export function get_documentation(server: SvelteMcp) {
	server.tool(
		{
			name: 'get-documentation',
			description:
				'Retrieves full documentation content for Svelte 5 or SvelteKit sections. Supports flexible search by title (e.g., "$state", "routing") or file path (e.g., "cli/overview"). Can accept a single section name or an array of sections. Before running this, make sure to analyze the users query, as well as the output from list-sections (which should be called first). Then ask for ALL relevant sections the user might require. For example, if the user asks to build anything interactive, you will need to fetch all relevant runes, and so on. Before calling this tool try to implement with your own knowledge and the `svelte-autofixer tool` since calling this tool is token intensive.',
			schema: v.object({
				section: v.pipe(
					v.union([v.string(), v.array(v.string())]),
					v.description(
						'The section name(s) to retrieve. Can search by title (e.g., "$state", "load functions") or file path (e.g., "cli/overview"). Supports single string and array of strings',
					),
				),
			}),
			icons,
		},
		async ({ section }) => {
			if (server.ctx.sessionId && server.ctx.custom?.track) {
				await server.ctx.custom?.track?.(server.ctx.sessionId, 'get-documentation');
			}
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

			const available_sections = await get_sections();

			const settled_results = await Promise.allSettled(
				sections.map(async (requested_section) => {
					const matched_section = available_sections.find(
						(s) =>
							s.title.toLowerCase() === requested_section.toLowerCase() ||
							s.slug === requested_section ||
							s.url === requested_section,
					);

					if (matched_section) {
						try {
							const response = await fetch_with_timeout(matched_section.url);
							if (response.ok) {
								const content = await response.text();
								return { success: true, content: `## ${matched_section.title}\n\n${content}` };
							} else {
								return {
									success: false,
									content: `## ${matched_section.title}\n\nError: Could not fetch documentation (HTTP ${response.status})`,
								};
							}
						} catch (error) {
							return {
								success: false,
								content: `## ${matched_section.title}\n\nError: Failed to fetch documentation - ${error}`,
							};
						}
					} else {
						return {
							success: false,
							content: `## ${requested_section}\n\nError: Section not found.`,
						};
					}
				}),
			);

			const results = settled_results.map((result) => {
				if (result.status === 'fulfilled') {
					return result.value;
				} else {
					return {
						success: false,
						content: `Error: Couldn't fetch - ${result.reason}`,
					};
				}
			});

			const has_any_success = results.some((result) => result.success);
			let final_text = results.map((r) => r.content).join('\n\n---\n\n');

			if (!has_any_success) {
				const formatted_sections = await format_sections_list();

				final_text += `\n\n---\n\n${SECTIONS_LIST_INTRO}\n\n${formatted_sections}\n\n${SECTIONS_LIST_OUTRO}`;
			}

			return tool.text(final_text);
		},
	);
}
