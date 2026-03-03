import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';

interface PluginJson {
	name: string;
	version: string;
	[key: string]: unknown;
}

const PLUGINS = [
	{
		name: 'Claude',
		diff_path: 'plugins/claude/svelte/',
		json_path: './plugins/claude/svelte/.claude-plugin/plugin.json',
	},
	{
		name: 'Cursor',
		diff_path: 'plugins/cursor/svelte/',
		json_path: './plugins/cursor/svelte/.cursor-plugin/plugin.json',
	},
];

function has_changes(diff_path: string): boolean {
	try {
		execSync(`git diff --exit-code ${diff_path}`, { stdio: 'pipe' });
		return false;
	} catch {
		return true;
	}
}

function bump_patch(version: string): string {
	const parts = version.split('.');
	if (parts.length !== 3) {
		throw new Error(`Invalid semver: ${version}`);
	}
	const [major, minor, patch] = parts;
	return `${major}.${minor}.${Number(patch) + 1}`;
}

for (const plugin of PLUGINS) {
	if (!has_changes(plugin.diff_path)) {
		console.log(`No changes in ${plugin.name} plugin, skipping version bump`);
		continue;
	}

	const raw = await fs.readFile(plugin.json_path, 'utf-8');
	const json: PluginJson = JSON.parse(raw);
	const old_version = json.version;
	json.version = bump_patch(old_version);

	await fs.writeFile(plugin.json_path, JSON.stringify(json, null, '\t') + '\n');
	console.log(`Bumped ${plugin.name} plugin: ${old_version} -> ${json.version}`);
}
