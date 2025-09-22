import { basename } from 'node:path';
import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';
import { add_compile_issues } from '../../autofixers/add-compile-issues.js';
import { add_eslint_issues } from '../../autofixers/add-eslint-issues.js';
import { add_autofixers_issues } from '../../autofixers/add-autofixers-issues.js';

export function svelte_autofixer(server: SvelteMcp) {
	server.tool(
		{
			name: 'svelte-autofixer',
			title: 'Svelte Autofixer',
			description:
				'Given a svelte component or module returns a list of suggestions to fix any issues it has. This tool MUST be used whenever the user is asking to write svelte code before sending the code back to the user',
			schema: v.object({
				code: v.string(),
				desired_svelte_version: v.pipe(
					v.union([v.literal(4), v.literal(5), v.literal('4'), v.literal('5')]),
					v.description(
						'The desired svelte version...if possible read this from the package.json of the user project, otherwise use some hint from the wording (if the user asks for runes it wants version 5). Default to 5 in case of doubt.',
					),
				),
				filename: v.pipe(
					v.optional(v.string()),
					v.description(
						'The filename of the component if available, it MUST be only the Component name with .svelte or .svelte.ts extension and not the entire path.',
					),
				),
			}),
			outputSchema: v.object({
				issues: v.array(v.string()),
				suggestions: v.array(v.string()),
				require_another_tool_call_after_fixing: v.boolean(),
			}),
			annotations: {
				title: 'Svelte Autofixer',
				destructiveHint: false,
				readOnlyHint: true,
				openWorldHint: false,
			},
		},
		async ({ code, filename: filename_or_path, desired_svelte_version }) => {
			const content: {
				issues: string[];
				suggestions: string[];
				require_another_tool_call_after_fixing: boolean;
			} = { issues: [], suggestions: [], require_another_tool_call_after_fixing: false };
			try {
				// just in case the LLM sends a full path we extract the filename...it's not really needed
				// but it's nice to have a filename in the errors

				const filename = filename_or_path ? basename(filename_or_path) : 'Component.svelte';

				add_compile_issues(content, code, +desired_svelte_version, filename);

				add_autofixers_issues(content, code, +desired_svelte_version, filename);

				await add_eslint_issues(content, code, +desired_svelte_version, filename);
			} catch (e: unknown) {
				const error = e as Error & { start?: { line: number; column: number } };
				content.issues.push(
					`${error.message} at line ${error.start?.line}, column ${error.start?.column}`,
				);
			}

			if (content.issues.length > 0 || content.suggestions.length > 0) {
				content.require_another_tool_call_after_fixing = true;
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(content),
					},
				],
				structuredContent: content,
			};
		},
	);
}
