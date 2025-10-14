#!/usr/bin/env node
import 'dotenv/config';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { load_existing_summaries } from './generate-summaries.ts';

interface CliOptions {
	type: 'use_cases' | 'distilled' | 'both';
	dryRun: boolean;
	clean: boolean;
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
	)
	.option('-d, --dry-run', 'Show what would be created without writing files', false)
	.option('-c, --clean', 'Remove existing summaries directory before exporting', false);

async function export_summaries_for_type(
	type: 'use_cases' | 'distilled',
	dry_run: boolean,
): Promise<void> {
	const json_filename = type === 'distilled' ? 'distilled.json' : 'use_cases.json';
	const input_path = path.join(current_dirname, `../src/${json_filename}`);
	const output_base_dir = path.join(current_dirname, `../summaries/${type}`);

	console.log(`\n📁 Processing ${type.toUpperCase()}...`);
	console.log(`  Input: ${json_filename}`);
	console.log(`  Output directory: summaries/${type}/`);

	// Load the JSON file
	console.log(`  📂 Loading ${json_filename}...`);
	const data = await load_existing_summaries(input_path);

	if (!data) {
		console.error(`  ❌ Error: Could not load ${json_filename}`);
		return;
	}

	const summaries = data.summaries;
	const summary_count = Object.keys(summaries).length;

	console.log(`  ✅ Found ${summary_count} summaries`);

	if (dry_run) {
		console.log(`  🔍 DRY RUN - Would create ${summary_count} files:`);
		for (const [slug, content] of Object.entries(summaries)) {
			const file_path = path.join(output_base_dir, `${slug}.md`);
			const content_preview =
				content.length > 60 ? content.substring(0, 60) + '...' : content;
			console.log(`    📄 ${file_path}`);
			console.log(`       ${content_preview.replace(/\n/g, ' ')}`);
		}
		return;
	}

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

	if (options.dryRun) {
		console.log('🔍 DRY RUN MODE - No files will be written\n');
	}

	// Clean existing summaries directory if requested
	if (options.clean && !options.dryRun) {
		const summaries_dir = path.join(current_dirname, '../summaries');
		console.log('🧹 Cleaning existing summaries directory...');
		try {
			await rm(summaries_dir, { recursive: true, force: true });
			console.log('✅ Cleaned summaries directory\n');
		} catch (error) {
			console.log('ℹ️  No existing summaries directory to clean\n');
		}
	}

	// Export based on type option
	if (options.type === 'both') {
		await export_summaries_for_type('use_cases', options.dryRun);
		await export_summaries_for_type('distilled', options.dryRun);
	} else {
		await export_summaries_for_type(options.type, options.dryRun);
	}

	console.log('\n✅ Export complete!');

	if (!options.dryRun) {
		console.log(
			'\n📊 Summary files have been written to:',
			path.join(current_dirname, '../summaries/'),
		);
	}
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
