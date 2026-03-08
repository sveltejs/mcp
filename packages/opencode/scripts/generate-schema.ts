import { toJsonSchema } from '@valibot/to-json-schema';
import { config_schema } from '../config.js';
import fs from 'node:fs';
import path from 'node:path';

// Known agents that can be configured
const known_agents = ['svelte-file-editor'];

const json_schema = toJsonSchema(config_schema);

// Post-process: inject known agent names for intellisense
// This is the JSON Schema equivalent of `"a" | "b" | (string & {})` —
// editors will autocomplete the known names but any string is still valid.
if (known_agents.length > 0) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const agent = (json_schema as any).properties?.agent;
	if (agent) {
		agent.propertyNames = {
			anyOf: [{ enum: known_agents }, { type: 'string' }],
		};
	}
}

fs.writeFileSync(path.resolve('./schema.json'), JSON.stringify(json_schema, null, '\t'));
