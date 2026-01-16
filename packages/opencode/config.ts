import type { PluginInput } from '@opencode-ai/plugin';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import * as v from 'valibot';

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
};

export const config_schema = v.object({
	mcp: v.optional(
		v.object({
			type: v.optional(v.picklist(['remote', 'local'])),
			enabled: v.optional(v.boolean()),
		}),
	),
	subagent: v.optional(
		v.object({
			enabled: v.optional(v.boolean()),
		}),
	),
	instructions: v.optional(
		v.object({
			enabled: v.optional(v.boolean()),
		}),
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

	// returning config_dir first so it has higher priority
	return [config_dir_path, global_path];
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
	};
}

export function get_mcp_config(ctx: PluginInput) {
	const config_paths = get_config_paths();
	for (const path of config_paths) {
		if (path && existsSync(path)) {
			const result = load_config_file(path);
			if (result.parse_error) {
				ctx.client.tui.showToast({
					body: {
						title: 'Svelte: Invalid opencode plugin config',
						message: `${result.parse_error}\nUsing default values`,
						variant: 'warning',
						duration: 7000,
					},
				});
				return default_config;
			}
			const parsed = v.safeParse(config_schema, result.data);
			if (parsed.success) {
				return merge_with_defaults(parsed.output);
			} else {
				ctx.client.tui.showToast({
					body: {
						title: 'Svelte: Invalid opencode plugin config',
						message: `${result.parse_error}\nUsing default values`,
						variant: 'warning',
						duration: 7000,
					},
				});
			}
		}
	}

	return default_config;
}
