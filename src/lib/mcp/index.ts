import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { HttpTransport } from '@tmcp/transport-http';
import { StdioTransport } from '@tmcp/transport-stdio';
import { McpServer } from 'tmcp';
import { setup_prompts, setup_resources, setup_tools } from './handlers';

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

export type SvelteMcp = typeof server;

setup_tools(server);
setup_resources(server);
setup_prompts(server);

export const http_transport = new HttpTransport(server, {
	cors: true,
});
export const stdio_transport = new StdioTransport(server);
