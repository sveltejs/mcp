import { toJsonSchema } from '@valibot/to-json-schema';
import { config_schema } from '../config.js';
import fs from 'node:fs';
import path from 'node:path';

function get_skill_names(skills_dir: string) {
	if (!fs.existsSync(skills_dir)) return [];
	return fs
		.readdirSync(skills_dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);
}

const skills_dir = path.resolve('./skills');
const skill_names = get_skill_names(skills_dir);
const schema = config_schema;
const json_schema = toJsonSchema(schema);

// Post-process: inject skill name suggestions into the items schema.
// This is the JSON Schema equivalent of `"a" | "b" | (string & {})` —
// editors will autocomplete the known names but any string is still valid.
if (skill_names.length > 0) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const enabled = (json_schema as any).properties?.skills?.properties?.enabled;
	if (enabled?.anyOf) {
		const array_branch = enabled.anyOf.find((s: Record<string, unknown>) => s.type === 'array');
		if (array_branch) {
			array_branch.items = {
				anyOf: [{ enum: skill_names }, { type: 'string' }],
			};
		}
	}
}

fs.writeFileSync(path.resolve('./schema.json'), JSON.stringify(json_schema, null, '\t'));
