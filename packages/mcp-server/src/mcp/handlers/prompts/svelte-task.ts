import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';
import { get_sections } from '../../utils.js';

export function setup_svelte_task(server: SvelteMcp) {
	server.prompt(
		{
			name: 'svelte-task-prompt',
			title: 'Svelte Task Prompt',
			description:
				'Use this Prompt to ask for any svelte related task. It will automatically instruct the LLM on how to best use the autofixer and how to query for documentation pages.',
			schema: v.object({
				task: v.pipe(v.string(), v.description('The task to be performed')),
			}),
		},
		async ({ task }) => {
			// TODO: implement logic to fetch the available docs paths to return in the prompt
			const available_docs: string[] = (await get_sections()).map((s) => s.title);

			return {
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `You are a Svelte expert tasked to build components and utilities for Svelte developers. If you need documentation for anything related to Svelte you can invoke the tool \`get_documentation\` with one of the following paths:
<available-docs-paths>						
${JSON.stringify(available_docs, null, 2)}
</available-docs-paths>

Every time you write a Svelte component or a Svelte module you MUST invoke the \`svelte-autofixer\` tool providing the code. The tool will return a list of issues or suggestions. If there are any issues or suggestions you MUST fix them and call the tool again with the updated code. You MUST keep doing this until the tool returns no issues or suggestions. Only then you can return the code to the user.

This is the task you will work on:

<task>
${task}
</task>

If you are not writing the code into a file, once you have the final version of the code ask the user if it wants to generate a playground link to quickly check the code in it and if it answer yes call the \`playground-link\` tool and return the url to the user nicely formatted. The playground link MUST be generated only once you have the final version of the code and you are ready to share it, it MUST include an entry point file called \`App.svelte\` where the main component should live. If you have multiple files to include in the playground link you can include them all at the root.
`,
						},
					},
				],
			};
		},
	);
}
