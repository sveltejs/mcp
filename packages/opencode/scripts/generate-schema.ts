import { toJsonSchema } from '@valibot/to-json-schema';
import { config_schema } from '../config.js';
import fs from 'node:fs';
import path from 'node:path';

const json_schema = toJsonSchema(config_schema);

fs.writeFileSync(path.resolve('./schema.json'), JSON.stringify(json_schema, null, '\t'));
