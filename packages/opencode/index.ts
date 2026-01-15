import type { Plugin } from '@opencode-ai/plugin';
import { get_mcp_config } from './config.js';

export const svelte_plugin: Plugin = async (ctx) => {
	return {
		async config(input) {
			input.agent ??= {};
			input.mcp ??= {};
			// by default we use svelte as the name for the svelte MCP server
			let svelte_mcp_name = 'svelte';
			// we loop over every mcp server to see if any of them is already the svelte MCP server
			for (const name in input.mcp) {
				const mcp = input.mcp[name];
				if (
					(mcp?.type === 'remote' && mcp.url.includes('https://mcp.svelte.dev/mcp')) ||
					(mcp?.type === 'local' &&
						mcp.command.some((cmd: string) => cmd.includes('@sveltejs/mcp')))
				) {
					// if we found the svelte MCP server, we store its name a break
					svelte_mcp_name = name;
					break;
				}
			}
			const mcp_config = get_mcp_config(ctx);

			// if the user doesn't have the MCP server already we add one based on config
			if (!input.mcp[svelte_mcp_name] && mcp_config.mcp?.enabled !== false) {
				if (mcp_config.mcp?.type === 'remote') {
					input.mcp[svelte_mcp_name] = {
						type: 'remote',
						url: 'https://mcp.svelte.dev/mcp',
					};
				} else {
					input.mcp[svelte_mcp_name] = {
						type: 'local',
						command: ['npx', '-y', '@sveltejs/mcp'],
					};
				}
			}
			if (mcp_config.subagent?.enabled !== false) {
				// we add the editor subagent that will be used when editing Svelte files to prevent wasting context on the main agent
				input.agent['svelte-file-editor'] = {
					color: '#ff3e00',
					mode: 'subagent',
					prompt: `You are a specialized Svelte coder. Always use the tools from the svelte MCP server to fetch documentation with \`get_documentation\` and validating the code with \`svelte_autofixer\`. If the autofixer returns any issue or suggestions solve them before summarizing the changes for the main agent.`,
					description:
						'Specialized Svelte 5 code editor. MUST BE USED PROACTIVELY when creating, editing, or reviewing any .svelte file or .svelte.ts/.svelte.js module and MUST use the tools from the MCP server. Fetches relevant documentation and validates code using the Svelte MCP server tools.',
					permission: {
						bash: 'ask',
						edit: 'allow',
						webfetch: 'ask',
					},
					tools: {
						[`${svelte_mcp_name}_*`]: true,
					},
				};
			}
		},
	};
};
