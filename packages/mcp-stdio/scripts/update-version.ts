import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const package_json_string = await readFile(resolve('./package.json'), 'utf-8');
const package_json = JSON.parse(package_json_string);

const server_json_path = resolve('./server.json');
const server_json_string = await readFile(server_json_path, 'utf-8');
const server_json = JSON.parse(server_json_string);

server_json.version = package_json.version;
server_json.packages[0].version = package_json.version;

await writeFile(server_json_path, JSON.stringify(server_json, null, '\t') + '\n', 'utf-8');
