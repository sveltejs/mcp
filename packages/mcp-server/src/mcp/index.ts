import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { McpServer } from 'tmcp';
import { setup_prompts, setup_resources, setup_tools } from './handlers/index.js';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { Schema } from '@sveltejs/mcp-schema';
import type { ClassType } from 'remult';

export const server = new McpServer(
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
).withContext<{ db: LibSQLDatabase<Schema>; entities: Record<string, ClassType<unknown>> }>();

export type SvelteMcp = typeof server;

setup_tools(server);
setup_resources(server);
setup_prompts(server);
