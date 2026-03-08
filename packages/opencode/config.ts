import type { PluginInput } from '@opencode-ai/plugin';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import * as v from 'valibot';

// Schema for individual agent configuration
const agent_config_schema = v.object({
	model: v.pipe(
		v.optional(v.string()),
		v.description('Model identifier for the agent (e.g., "anthropic/claude-sonnet-4-20250514")'),
	),
	variant: v.pipe(
		v.optional(v.string()),
		v.description('Variant identifier for the agent (e.g., "coding")'),
	),
});

const default_config = {
	mcp: {
		type: 'remote' as 'remote' | 'local',
		enabled: true,
	},
	subagent: {
		enabled: true,
	},
	instructions: {
		enabled: true,
	},
	skills: {
		enabled: true,
	},
	agent: {} as Record<string, v.InferInput<typeof agent_config_schema>>,
};

export const config_schema = v.object({
	mcp: v.pipe(
		v.optional(
			v.object({
				type: v.optional(v.picklist(['remote', 'local'])),
				enabled: v.optional(v.boolean()),
			}),
		),
		v.description(
			"Configuration for the MCP. You can chose if it should be enabled or not and the transport to use 'remote' (default) and 'local'.",
		),
	),
	subagent: v.pipe(
		v.optional(
			v.object({
				enabled: v.optional(v.boolean()),
			}),
		),
		v.description('Configuration for the subagent. You can choose if it should be enabled or not.'),
	),
	instructions: v.pipe(
		v.optional(
			v.object({
				enabled: v.optional(v.boolean()),
			}),
		),
		v.description(
			'Configuration for the automatic AGENTS.md injection. You can choose if it should be enabled or not.',
		),
	),
	skills: v.pipe(
		v.optional(
			v.object({
				enabled: v.pipe(
					v.optional(v.union([v.boolean(), v.array(v.string())])),
					v.description(
						'It can be either a boolean or an array containing the skills that you want to enable',
					),
				),
			}),
		),
		v.description(
			'Configuration for the skills. You can choose if it they should be enabled or not, or specify an array of skill names to enable only specific skills.',
		),
	),
	agent: v.pipe(
		v.optional(v.record(v.string(), agent_config_schema)),
		v.description('Per-agent configuration. Configure model and variant for specific agents.'),
	),
});

export type McpConfig = v.InferInput<typeof config_schema>;

const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'opencode');
const GLOBAL_CONFIG_PATH = join(GLOBAL_CONFIG_DIR, 'svelte.json');

interface ConfigLoadResult {
	data: Record<string, unknown> | null;
	parse_error?: string;
}

function get_config_paths() {
	// Global: ~/.config/opencode/svelte.json
	let global_path: string | null = null;
	if (existsSync(GLOBAL_CONFIG_PATH)) {
		global_path = GLOBAL_CONFIG_PATH;
	}

	// Custom config directory: $OPENCODE_CONFIG_DIR/svelte.json
	let config_dir_path: string | null = null;
	const opencode_config_dir = process.env.OPENCODE_CONFIG_DIR;
	if (opencode_config_dir) {
		const config_json = join(opencode_config_dir, 'svelte.json');
		if (existsSync(config_json)) {
			config_dir_path = config_json;
		}
	}

	// Project-local: ./.opencode/svelte.json (cwd)
	let project_path: string | null = null;
	const project_config = join(process.cwd(), '.opencode', 'svelte.json');
	if (existsSync(project_config)) {
		project_path = project_config;
	}

	// Lowest priority first, highest priority last (project overrides global)
	return [global_path, config_dir_path, project_path];
}

function load_config_file(config_path: string): ConfigLoadResult {
	let file_content: string;
	try {
		file_content = readFileSync(config_path, 'utf-8');
	} catch {
		// File doesn't exist or can't be read
		return { data: null };
	}

	try {
		const parsed = JSON.parse(file_content);
		if (parsed === undefined || parsed === null) {
			return { data: null, parse_error: 'Config file is empty or invalid' };
		}
		return { data: parsed };
	} catch (error: unknown) {
		return {
			data: null,
			parse_error: error instanceof Error ? error.message : 'Failed to parse config',
		};
	}
}

function merge_with_defaults(user_config: Partial<McpConfig>): McpConfig {
	return {
		mcp: {
			...default_config.mcp,
			...user_config.mcp,
		},
		subagent: {
			...default_config.subagent,
			...user_config.subagent,
		},
		instructions: {
			...default_config.instructions,
			...user_config.instructions,
		},
		skills: {
			...default_config.skills,
			...user_config.skills,
		},
		agent: {
			...default_config.agent,
			...user_config.agent,
		},
	};
}

export function get_mcp_config(ctx: PluginInput) {
	const config_paths = get_config_paths();
	let merged: Partial<McpConfig> = {};

	// Iterate from lowest to highest priority, merging as we go
	for (const path of config_paths) {
		if (path && existsSync(path)) {
			const result = load_config_file(path);
			if (result.parse_error) {
				setTimeout(() => {
					ctx.client.tui.showToast({
						body: {
							title: 'Svelte: Invalid opencode plugin config',
							message: `${result.parse_error} (${path})\nSkipping this config file`,
							variant: 'warning',
							duration: 7000,
						},
					});
				}, 7000);
				continue;
			}
			const parsed = v.safeParse(config_schema, result.data);
			if (parsed.success) {
				merged = {
					mcp: { ...merged.mcp, ...parsed.output.mcp },
					subagent: { ...merged.subagent, ...parsed.output.subagent },
					instructions: { ...merged.instructions, ...parsed.output.instructions },
					skills: { ...merged.skills, ...parsed.output.skills },
					agent: { ...merged.agent, ...parsed.output.agent },
				};
			} else {
				setTimeout(() => {
					ctx.client.tui.showToast({
						body: {
							title: 'Svelte: Invalid opencode plugin config',
							message: `Invalid config schema (${path})\nSkipping this config file`,
							variant: 'warning',
							duration: 7000,
						},
					});
				}, 7000);
			}
		}
	}

	return merge_with_defaults(merged);
}
