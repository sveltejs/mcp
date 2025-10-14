#!/usr/bin/env node
import 'dotenv/config';
import { writeFile, mkdir, rm, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import * as v from 'valibot';
import { summary_data_schema, type SummaryData } from '../src/lib/schemas.ts';

interface CliOptions {
	type: 'use_cases' | 'distilled' | 'both';
}

const current_filename = fileURLToPath(import.meta.url);
const current_dirname = path.dirname(current_filename);

const program = new Command();

program
	.name('export-summaries')
	.description('Export summaries from JSON files to individual markdown files')
	.version('1.0.0')
	.option(
		'-t, --type <type>',
		'Type to export: "use_cases", "distilled", or "both"',
		'both',
	);

async function read_file_as_string(
	file_path: string,
	encoding: BufferEncoding = 'utf-8',
): Promise<string> {
	const content = await readFile(file_path, encoding);
	return v.parse(v.string(), content);
}

async function load_summaries_json(output_path: string): Promise<SummaryData | null> {
	try {
		await access(output_path);
	} catch {
		return null;
	}

	const content = await read_file_as_string(output_path, 'utf-8');
	const data = JSON.parse(content);

	const validated = v.safeParse(summary_data_schema, data);
	if (!validated.success) {
		throw new Error(
			`File has invalid schema: ${output_path}\n` +
				`Validation errors: ${JSON.stringify(validated.issues, null, 2)}`,
		);
	}

	return validated.output;
}

async function export_summaries_for_type(type: 'use_cases' | 'distilled'): Promise<void> {
	const json_filename = type === 'distilled' ? 'distilled.json' : 'use_cases.json';
	const input_path = path.join(current_dirname, `../src/${json_filename}`);
	const output_base_dir = path.join(current_dirname, `../summaries/${type}`);

	console.log(`\n📁 Processing ${type.toUpperCase()}...`);
	console.log(`  Input: ${json_filename}`);
	console.log(`  Output directory: summaries/${type}/`);

	// Load the JSON file
	console.log(`  📂 Loading ${json_filename}...`);
	const data = await load_summaries_json(input_path);

	if (!data) {
		console.error(`  ❌ Error: Could not load ${json_filename}`);
		return;
	}

	const summaries = data.summaries;
	const summary_count = Object.keys(summaries).length;

	console.log(`  ✅ Found ${summary_count} summaries`);

	// Create base output directory
	await mkdir(output_base_dir, { recursive: true });

	let created_count = 0;

	// Write each summary to a markdown file
	for (const [slug, content] of Object.entries(summaries)) {
		const file_path = path.join(output_base_dir, `${slug}.md`);
		const file_dir = path.dirname(file_path);

		// Create nested directories if needed
		await mkdir(file_dir, { recursive: true });

		// Write the markdown file
		await writeFile(file_path, content, 'utf-8');
		created_count++;

		if (created_count % 10 === 0) {
			console.log(`  📝 Created ${created_count}/${summary_count} files...`);
		}
	}

	console.log(`  ✅ Successfully created ${created_count} markdown files`);
}

async function main() {
	program.parse();
	const options = program.opts<CliOptions>();

	console.log('🚀 Starting summary export...');

	// Validate type option
	if (!['use_cases', 'distilled', 'both'].includes(options.type)) {
		console.error('❌ Error: --type must be "use_cases", "distilled", or "both"');
		process.exit(1);
	}

	// Always clean existing summaries directory
	const summaries_dir = path.join(current_dirname, '../summaries');
	console.log('🧹 Cleaning existing summaries directory...');
	try {
		await rm(summaries_dir, { recursive: true, force: true });
		console.log('✅ Cleaned summaries directory\n');
	} catch (error) {
		console.log('ℹ️  No existing summaries directory to clean\n');
	}

	// Export based on type option
	if (options.type === 'both') {
		await export_summaries_for_type('use_cases');
		await export_summaries_for_type('distilled');
	} else {
		await export_summaries_for_type(options.type);
	}

	console.log('\n✅ Export complete!');
	console.log(
		'\n📊 Summary files have been written to:',
		path.join(current_dirname, '../summaries/'),
	);
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
