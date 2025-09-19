import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { HttpTransport } from '@tmcp/transport-http';
import { StdioTransport } from '@tmcp/transport-stdio';
import { McpServer } from 'tmcp';
import * as v from 'valibot';
import { add_autofixers_issues } from './autofixers/add-autofixers-issues.js';
import { add_compile_issues } from './autofixers/add-compile-issues.js';
import { add_eslint_issues } from './autofixers/add-eslint-issues.js';
import { basename } from 'node:path';

const server = new McpServer(
	{
		name: 'Svelte MCP',
		version: '0.0.1',
		description: 'The official Svelte MCP server implementation',
	},
	{
		adapter: new ValibotJsonSchemaAdapter(),
		capabilities: {
			tools: {},
			prompts: {},
			resources: {},
			completions: {},
		},
		instructions:
			'This is the official Svelte MCP server. It MUST be used whenever svelte development is involved. It can provide official documentation, code examples and correct your code. After you correct the component call this tool again to confirm all the issues are fixed.',
	},
);

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
		const available_docs: string[] = [];

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
`,
					},
				},
			],
		};
	},
);

export const http_transport = new HttpTransport(server, {
	cors: true,
});
export const stdio_transport = new StdioTransport(server);
