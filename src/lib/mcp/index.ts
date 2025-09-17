import { walk } from '../index.js';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { HttpTransport } from '@tmcp/transport-http';
import { StdioTransport } from '@tmcp/transport-stdio';
import type { Node } from 'estree';
import { McpServer } from 'tmcp';
import * as v from 'valibot';
import { parse } from '../server/analyze/parse.js';
import * as autofixers from './autofixers.js';
import { get_linter } from './eslint.js';

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
			issues: v.optional(v.array(v.string())),
			suggestions: v.optional(v.array(v.string())),
		}),
		annotations: {
			title: 'Svelte Autofixer',
			destructiveHint: false,
			readOnlyHint: true,
			openWorldHint: false,
		},
	},
	async ({ code, filename, desired_svelte_version }) => {
		const content: { issues: string[]; suggestions: string[] } = { issues: [], suggestions: [] };

		const parsed = parse(code, filename ?? 'Component.svelte');

		// Run each autofixer separately to avoid interrupting logic flow
		for (const autofixer of Object.values(autofixers)) {
			walk(
				parsed.ast as unknown as Node,
				{ output: content, parsed, desired_svelte_version },
				autofixer,
			);
		}

		const eslint = get_linter(desired_svelte_version);
		const results = await eslint.lintText(code, { filePath: filename || './Component.svelte' });

		for (const message of results[0].messages) {
			if (message.severity === 2) {
				content.issues.push(
					`ESLint Error: ${message.message} at line ${message.line}, column ${message.column}`,
				);
			} else if (message.severity === 1) {
				content.suggestions.push(
					`ESLint Warning: ${message.message} at line ${message.line}, column ${message.column}`,
				);
			}
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
