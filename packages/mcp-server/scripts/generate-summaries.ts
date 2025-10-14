#!/usr/bin/env node
import 'dotenv/config';
import { writeFile, mkdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { get_sections } from '../src/mcp/utils.ts';
import { AnthropicProvider } from '../src/lib/anthropic.ts';
import {
	type AnthropicBatchRequest,
	type SummaryData,
	summary_data_schema,
} from '../src/lib/schemas.ts';
import * as v from 'valibot';
import { DISTILLED_PROMPT, USE_CASES_PROMPT } from '../src/mcp/handlers/tools/prompts.ts';
import { export_summaries_to_markdown } from './lib/export-markdown.ts';

interface CliOptions {
	force: boolean;
	dryRun: boolean;
	debug: boolean;
	promptType: 'use-cases' | 'distilled';
}

interface SectionChange {
	slug: string;
	title: string;
	url: string;
	change_type: 'new' | 'changed' | 'removed';
}

const current_filename = fileURLToPath(import.meta.url);
const current_dirname = path.dirname(current_filename);

async function read_file_as_string(
	file_path: string,
	encoding: BufferEncoding = 'utf-8',
): Promise<string> {
	const content = await readFile(file_path, encoding);
	return v.parse(v.string(), content);
}

const program = new Command();

program
	.name('generate-summaries')
	.description('Generate use case summaries for Svelte documentation sections')
	.version('1.0.0')
	.option('-f, --force', 'Force regeneration of all summaries', false)
	.option('-d, --dry-run', 'Show what would be changed without making API calls', false)
	.option('--debug', 'Debug mode: process only 2 sections', false)
	.option(
		'-p, --prompt-type <type>',
		'Prompt type to use: "use-cases" or "distilled"',
		'use-cases',
	);

async function fetch_section_content(url: string) {
	const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}
	return await response.text();
}

export async function load_existing_summaries(output_path: string): Promise<SummaryData | null> {
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
			`Existing file has invalid schema. Please fix or delete the file at: ${output_path}\n` +
				`Validation errors: ${JSON.stringify(validated.issues, null, 2)}`,
		);
	}

	return validated.output;
}

function detect_changes(
	current_sections: Array<{ slug: string; title: string; url: string }>,
	existing_data: SummaryData | null,
	current_content: Map<string, string>,
	force: boolean,
): {
	to_process: Array<{ slug: string; title: string; url: string }>;
	to_remove: string[];
	changes: SectionChange[];
} {
	if (!existing_data || force) {
		// First run or force regeneration
		return {
			to_process: current_sections,
			to_remove: [],
			changes: current_sections.map((s) => ({
				...s,
				change_type: force ? 'changed' : 'new',
			})),
		};
	}

	const existing_summaries = existing_data.summaries;
	const existing_content = existing_data.content;
	const existing_slugs = new Set(Object.keys(existing_summaries));
	const current_slugs = new Set(current_sections.map((s) => s.slug));

	const sections_to_process: typeof current_sections = [];
	const changes: SectionChange[] = [];

	// Check for new and changed sections
	for (const section of current_sections) {
		const content = current_content.get(section.slug);
		if (!content) {
			throw new Error(`No content found for section: ${section.slug}`);
		}

		if (!existing_slugs.has(section.slug)) {
			// New section
			sections_to_process.push(section);
			changes.push({ ...section, change_type: 'new' });
		} else {
			// Existing section - check if content changed
			const stored_content = existing_content[section.slug] ?? '';

			if (content !== stored_content) {
				// Content has changed
				sections_to_process.push(section);
				changes.push({ ...section, change_type: 'changed' });
			}
		}
	}

	// Find removed sections
	const removed_slugs: string[] = [];
	for (const slug of existing_slugs) {
		if (!current_slugs.has(slug)) {
			removed_slugs.push(slug);
			changes.push({
				slug,
				title: '<removed>',
				url: '',
				change_type: 'removed',
			});
		}
	}

	return {
		to_process: sections_to_process,
		to_remove: removed_slugs,
		changes,
	};
}

async function main() {
	program.parse();
	const options = program.opts<CliOptions>();

	// Allow DEBUG_MODE env var as well
	const debug = options.debug || process.env.DEBUG_MODE === '1';

	console.log('🚀 Starting use cases generation...');

	// Determine output file based on prompt type
	const output_filename = options.promptType === 'distilled' ? 'distilled.json' : 'use_cases.json';
	const output_path = path.join(current_dirname, `../src/${output_filename}`);

	// Select prompt based on prompt type
	const selected_prompt = options.promptType === 'distilled' ? DISTILLED_PROMPT : USE_CASES_PROMPT;

	// Display mode information
	console.log(`📝 PROMPT MODE: ${options.promptType.toUpperCase()} → ${output_filename}\n`);
	if (options.dryRun) {
		console.log('🔍 DRY RUN MODE - No API calls will be made\n');
	}
	if (options.force) {
		console.log('⚡ FORCE MODE - Regenerating all summaries\n');
	}
	if (debug) {
		console.log('🐛 DEBUG MODE - Will process only 2 sections\n');
	}

	// Load existing summaries
	console.log('📂 Loading existing summaries...');
	const existing_data = await load_existing_summaries(output_path);

	if (existing_data) {
		console.log(
			`✅ Found existing summaries with ${Object.keys(existing_data.summaries).length} entries`,
		);
	} else {
		console.log('📝 No existing summaries found - will process all sections');
	}

	console.log('📚 Fetching documentation sections...');
	const all_sections = await get_sections();
	console.log(`Found ${all_sections.length} sections from API`);

	// Download content for ALL sections (needed to compute hashes)
	console.log('\n📥 Downloading section content...');
	const section_content = new Map<string, string>();

	for (let i = 0; i < all_sections.length; i++) {
		const section = all_sections[i]!;
		console.log(`  Fetching ${i + 1}/${all_sections.length}: ${section.title}`);
		const content = await fetch_section_content(section.url);
		section_content.set(section.slug, content);
	}

	console.log(`✅ Successfully downloaded ${section_content.size} sections`);

	// Detect what needs to be processed
	console.log('\n🔍 Checking for content changes...');
	const { to_process, to_remove, changes } = detect_changes(
		all_sections,
		existing_data,
		section_content,
		options.force,
	);

	// Display changes
	console.log('\n📊 Change Summary:');
	const new_count = changes.filter((c) => c.change_type === 'new').length;
	const changed_count = changes.filter((c) => c.change_type === 'changed').length;
	const removed_count = changes.filter((c) => c.change_type === 'removed').length;

	console.log(`  ✨ New sections: ${new_count}`);
	console.log(`  🔄 Changed sections: ${changed_count}`);
	console.log(`  ❌ Removed sections: ${removed_count}`);
	console.log(`  📝 To process: ${to_process.length}`);

	if (changes.length > 0) {
		console.log('\n📋 Detailed changes:');
		for (const change of changes) {
			const emoji =
				change.change_type === 'new' ? '  ✨' : change.change_type === 'changed' ? '  🔄' : '  ❌';
			console.log(`${emoji} [${change.change_type.toUpperCase()}] ${change.slug}`);
		}
	}

	// Exit early if nothing to do
	if (to_process.length === 0 && to_remove.length === 0) {
		console.log('\n✅ No changes detected - everything is up to date!');
		return;
	}

	// Debug mode: limit sections
	let sections_to_process = to_process;
	if (debug) {
		console.log('\n🐛 Processing only 2 sections for debugging');
		sections_to_process = to_process.slice(0, 2);
	}

	// Dry run mode: exit before API calls
	if (options.dryRun) {
		console.log('\n🔍 DRY RUN complete - no changes were made');
		console.log(`Would have processed ${sections_to_process.length} sections`);
		console.log(`Would have removed ${to_remove.length} sections`);
		return;
	}

	// Process with Anthropic API if we have sections to process
	const new_summaries: Record<string, string> = {};
	let sections_with_content: Array<{
		section: (typeof sections_to_process)[number];
		content: string;
		index: number;
	}> = [];

	if (sections_to_process.length === 0) {
		console.log('\n📦 Only removing old sections, no API calls needed');
	} else {
		// Check for API key
		const api_key = process.env.ANTHROPIC_API_KEY;
		if (!api_key) {
			console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
			console.error('Please set it in packages/mcp-server/.env file or export it:');
			console.error('export ANTHROPIC_API_KEY=your_api_key_here');
			process.exit(1);
		}

		// Build sections_with_content from already-downloaded content
		console.log('\n📦 Preparing sections for processing...');

		for (let i = 0; i < sections_to_process.length; i++) {
			const section = sections_to_process[i]!;
			const content = section_content.get(section.slug);

			if (!content) {
				throw new Error(`No content available for ${section.title}`);
			}

			sections_with_content.push({
				section,
				content,
				index: i,
			});
		}

		console.log(`✅ Prepared ${sections_with_content.length} sections for processing`);

		console.log('\n🤖 Initializing Anthropic API...');
		const anthropic = new AnthropicProvider('claude-sonnet-4-5-20250929', api_key);

		// Prepare batch requests
		console.log('📦 Preparing batch requests...');
		const batch_requests: AnthropicBatchRequest[] = sections_with_content.map(
			({ content, index }) => ({
				custom_id: `section-${index}`,
				params: {
					model: anthropic.get_model_identifier(),
					max_tokens: 8192,
					messages: [
						{
							role: 'user',
							content:
								`<instructions>${selected_prompt}</instructions>` +
								`<documentation>${content}</documentation>`,
						},
					],
					temperature: 0,
				},
			}),
		);

		// Create and process batch
		console.log('🚀 Creating batch job...');
		const batch_response = await anthropic.create_batch(batch_requests);
		console.log(`✅ Batch created with ID: ${batch_response.id}`);

		// Poll for completion
		console.log('⏳ Waiting for batch to complete...');
		let batch_status = await anthropic.get_batch_status(batch_response.id);

		while (batch_status.processing_status === 'in_progress') {
			const { succeeded, processing, errored } = batch_status.request_counts;
			console.log(
				`  Progress: ${succeeded} succeeded, ${processing} processing, ${errored} errored`,
			);
			await new Promise((resolve) => setTimeout(resolve, 5000));
			batch_status = await anthropic.get_batch_status(batch_response.id);
		}

		console.log('✅ Batch processing completed!');

		// Get results
		if (!batch_status.results_url) {
			throw new Error('Batch completed but no results URL available');
		}

		console.log('📥 Downloading results...');
		const results = await anthropic.get_batch_results(batch_status.results_url);

		// Process results
		console.log('📊 Processing results...');

		for (const result of results) {
			const index = parseInt(result.custom_id.split('-')[1] ?? '0');
			const section_data = sections_with_content.find((s) => s.index === index);

			if (!section_data) {
				throw new Error(`Could not find section for index ${index}`);
			}

			const { section } = section_data;

			if (result.result.type !== 'succeeded' || !result.result.message) {
				const error_msg = result.result.error?.message || 'Failed or no message';
				throw new Error(`Failed to generate summary for ${section.title}: ${error_msg}`);
			}

			const output_content = result.result.message.content[0]?.text;
			if (!output_content) {
				throw new Error(`No text content in result for ${section.title}`);
			}

			new_summaries[section.slug] = output_content.trim();
			console.log(`  ✅ ${section.title}`);
		}

		// Merge with existing summaries
		console.log('\n📦 Merging results...');
	}

	// Start with existing summaries or empty object
	const merged_summaries: Record<string, string> = existing_data
		? { ...existing_data.summaries }
		: {};

	// Add/update new summaries
	Object.assign(merged_summaries, new_summaries);

	// Remove deleted sections from summaries
	for (const slug of to_remove) {
		delete merged_summaries[slug];
		console.log(`  🗑️  Removed: ${slug}`);
	}

	// Write output
	console.log('\n💾 Writing results to file...');
	const output_dir = path.dirname(output_path);
	await mkdir(output_dir, { recursive: true });

	const summary_data: SummaryData = {
		generated_at: new Date().toISOString(),
		model: 'claude-sonnet-4-5-20250929',
		total_sections: all_sections.length,
		successful_summaries: Object.keys(merged_summaries).length,
		summaries: merged_summaries,
		content: Object.fromEntries(section_content),
	};

	await writeFile(output_path, JSON.stringify(summary_data, null, 2), 'utf-8');

	// Export summaries to markdown files
	console.log('\n📁 Exporting summaries to markdown files...');
	const markdown_type = options.promptType === 'distilled' ? 'distilled' : 'use_cases';
	const markdown_files_created = await export_summaries_to_markdown(
		merged_summaries,
		markdown_type,
		path.join(current_dirname, '../summaries'),
	);

	// Print summary
	console.log('\n📊 Final Summary:');
	console.log(`  Total sections in API: ${all_sections.length}`);
	console.log(`  Sections processed: ${sections_with_content.length}`);
	console.log(`  New summaries generated: ${Object.keys(new_summaries).length}`);
	console.log(`  Sections removed: ${to_remove.length}`);
	console.log(`  Total summaries in file: ${Object.keys(merged_summaries).length}`);
	console.log(`  Markdown files created: ${markdown_files_created}`);
	console.log(`\n✅ Results written to: ${output_path}`);
	console.log(
		`✅ Markdown files written to: ${path.join(current_dirname, `../summaries/${markdown_type}/`)}`,
	);
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
