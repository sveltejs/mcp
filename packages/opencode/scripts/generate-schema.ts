import { toJsonSchema } from '@valibot/to-json-schema';
import { config_schema } from '../config.js';
import fs from 'node:fs';
import path from 'node:path';

// Read agent names from tools/agents/*.md files
function get_agent_names(agents_dir: string) {
	if (!fs.existsSync(agents_dir)) return [];
	return fs
		.readdirSync(agents_dir, { withFileTypes: true })
		.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
		.map((entry) => entry.name.replace(/\.md$/, ''));
}

const json_schema = toJsonSchema(config_schema);

// Post-process: inject known agent names for intellisense
// This is the JSON Schema equivalent of `"a" | "b" | (string & {})` —
// editors will autocomplete the known names but any string is still valid.
const agents_dir = path.resolve('../../tools/agents');
const agent_names = get_agent_names(agents_dir);

if (agent_names.length > 0) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const agent = (json_schema as any).properties?.agent;
	if (agent) {
		agent.propertyNames = {
			anyOf: [{ enum: agent_names }, { type: 'string' }],
		};
	}
}

fs.writeFileSync(path.resolve('./schema.json'), JSON.stringify(json_schema, null, '\t'));
