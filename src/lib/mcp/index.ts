import { mix_visitors, walk } from '../index.js';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { HttpTransport } from '@tmcp/transport-http';
import { StdioTransport } from '@tmcp/transport-stdio';
import type { Node } from 'estree';
import { McpServer } from 'tmcp';
import * as v from 'valibot';
import { parse } from '../server/analyze/parse.js';
import * as autofixers from './autofixers.js';

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
			'This is the official Svelte MCP server. It MUST be used whenever svelte development is involved. It can provide official documentation, code examples and correct your code',
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
	async ({ code, filename }) => {
		const content: { issues: string[]; suggestions: string[] } = { issues: [], suggestions: [] };

		const parsed = parse(code, filename ?? 'Component.svelte');

		walk(parsed.ast as unknown as Node, { output: content, parsed }, mix_visitors(autofixers));

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
