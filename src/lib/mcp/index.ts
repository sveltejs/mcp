import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { HttpTransport } from '@tmcp/transport-http';
import { StdioTransport } from '@tmcp/transport-stdio';
import { McpServer } from 'tmcp';
import * as v from 'valibot';
import { add_autofixers_issues } from './autofixers/add-autofixers-issues.js';
import { add_compile_issues } from './autofixers/add-compile-issues.js';
import { add_eslint_issues } from './autofixers/add-eslint-issues.js';

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
				v.union([v.literal(4), v.literal(5)]),
				v.description(
					'The desired svelte version...if possible read this from the package.json of the user project, otherwise use some hint from the wording (if the user asks for runes it wants version 5). Default to 5 in case of doubt.',
				),
			),
			filename: v.optional(v.string()),
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
	async ({ code, filename, desired_svelte_version }) => {
		const content: {
			issues: string[];
			suggestions: string[];
			require_another_tool_call_after_fixing: boolean;
		} = { issues: [], suggestions: [], require_another_tool_call_after_fixing: false };
		try {
			add_compile_issues(content, code, desired_svelte_version, filename);

			add_autofixers_issues(content, code, desired_svelte_version, filename);

			await add_eslint_issues(content, code, desired_svelte_version, filename);
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

export const http_transport = new HttpTransport(server, {
	cors: true,
});
export const stdio_transport = new StdioTransport(server);
