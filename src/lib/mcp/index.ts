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

// Handler functions
const listSectionsHandler = async (): Promise<{
	content: Array<{ type: string; text: string }>;
}> => {
	return {
		content: [
			{
				type: 'text',
				text: 'tool list_sections called',
			},
		],
	};
};

const getDocumentationHandler = async ({
	section,
}: {
	section: string | string[];
}): Promise<{
	content: Array<{ type: string; text: string }>;
}> => {
	return {
		content: [
			{
				type: 'text',
				text: 'tool get_documentation called',
			},
		],
	};
};

// List sections tool
server.tool(
	{
		name: 'list_sections',
		description:
			'Lists all available Svelte 5 and SvelteKit documentation sections in a structured format. Returns sections as a list of "* title: [section_title], path: [file_path]" - you can use either the title or path when querying a specific section via the get_documentation tool. Always run list_sections first for any query related to Svelte development to discover available content.',
	},
	listSectionsHandler,
);

// Get documentation tool
server.tool(
	{
		name: 'get_documentation',
		description:
			'Retrieves full documentation content for Svelte 5 or SvelteKit sections. Supports flexible search by title (e.g., "$state", "routing") or file path (e.g., "docs/svelte/state.md"). Can accept a single section name or an array of sections. Before running this, make sure to analyze the users query, as well as the output from list_sections (which should be called first). Then ask for ALL relevant sections the user might require. For example, if the user asks to build anything interactive, you will need to fetch all relevant runes, and so on.',
		schema: v.object({
			section: v.pipe(
				v.union([v.string(), v.array(v.string())]),
				v.description(
					'The section name(s) to retrieve. Can search by title (e.g., "$state", "load functions") or file path (e.g., "docs/svelte/state.md"). Supports single string and array of strings',
				),
			),
		}),
	},
	getDocumentationHandler,
);

export const http_transport = new HttpTransport(server, {
	cors: true,
});
export const stdio_transport = new StdioTransport(server);
