import type { SvelteMcp } from '../index.js';
import * as prompts from './prompts/index.js';
import * as tools from './tools/index.js';
import * as resources from './resources/index.js';

export function setup_tools(server: SvelteMcp) {
	for (const tool in tools) {
		tools[tool as keyof typeof tools](server);
	}
}

export function setup_prompts(server: SvelteMcp) {
	for (const prompt in prompts) {
		prompts[prompt as keyof typeof prompts](server);
	}
}

export function setup_resources(server: SvelteMcp) {
	for (const resource in resources) {
		resources[resource as keyof typeof resources](server);
	}
}
