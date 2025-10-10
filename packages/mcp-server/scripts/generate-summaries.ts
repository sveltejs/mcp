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

interface CliOptions {
	force: boolean;
	dryRun: boolean;
	debug: boolean;
}

interface SectionChange {
	slug: string;
	title: string;
	url: string;
	change_type: 'new' | 'updated' | 'removed';
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

const USE_CASES_PROMPT = `
You are tasked with analyzing Svelte 5 and SvelteKit documentation pages to identify when they would be useful.

Your task:
1. Read the documentation page content provided
2. Identify the main use cases, scenarios, or queries where this documentation would be relevant
3. Create a VERY SHORT, comma-separated list of use cases (maximum 200 characters total)
4. Think about what a developer might be trying to build or accomplish when they need this documentation

Guidelines:
- Focus on WHEN this documentation would be needed, not WHAT it contains
- Consider specific project types (e.g., "e-commerce site", "blog", "dashboard", "social media app")
- Consider specific features (e.g., "authentication", "forms", "data fetching", "animations")
- Consider specific components (e.g., "slider", "modal", "dropdown", "card")
- Consider development stages (e.g., "project setup", "deployment", "testing", "migration")
- Use "always" for fundamental concepts that apply to virtually all Svelte projects
- Be concise but specific
- Use lowercase
- Separate multiple use cases with commas

Examples of good use_cases:
- "always, any svelte project, core reactivity"
- "authentication, login systems, user management"
- "e-commerce, product listings, shopping carts"
- "forms, user input, data submission"
- "deployment, production builds, hosting setup"
- "animation, transitions, interactive ui"
- "routing, navigation, multi-page apps"
- "blog, content sites, markdown rendering"

Requirements:
- Maximum 200 characters (including spaces and commas)
- Lowercase only
- Comma-separated list of use cases
- Focus on WHEN/WHY someone would need this, not what it is
- Be specific about project types, features, or components when applicable
- Use "always" sparingly, only for truly universal concepts
- Do not include quotes or special formatting in your response
- Respond with ONLY the use cases text, no additional text

Here is the documentation page content to analyze:

`;

const program = new Command();

program
	.name('generate-summaries')
	.description('Generate use case summaries for Svelte documentation sections')
	.version('1.0.0')
	.option('-f, --force', 'Force regeneration of all summaries', false)
	.option('-d, --dry-run', 'Show what would be changed without making API calls', false)
	.option('--debug', 'Debug mode: process only 2 sections', false);

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
			`Existing use_cases.json has invalid schema. Please fix or delete the file at: ${output_path}\n` +
				`Validation errors: ${JSON.stringify(validated.issues, null, 2)}`,
		);
	}

	return validated.output;
}

function detect_changes(
	current_sections: Array<{ slug: string; title: string; url: string }>,
	existing_data: SummaryData | null,
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
				change_type: force ? 'updated' : 'new',
			})),
		};
	}

	const existing_summaries = existing_data.summaries;
	const existing_slugs = new Set(Object.keys(existing_summaries));
	const current_slugs = new Set(current_sections.map((s) => s.slug));

	const new_sections: typeof current_sections = [];
	const changes: SectionChange[] = [];

	// Find new and potentially updated sections
	for (const section of current_sections) {
		if (!existing_slugs.has(section.slug)) {
			new_sections.push(section);
			changes.push({ ...section, change_type: 'new' });
		}
		// You could add logic here to detect updated sections based on title changes, etc.
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
		to_process: new_sections,
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

	const output_path = path.join(current_dirname, '../src/use_cases.json');

	// Display mode information
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

	// Detect what needs to be processed
	const { to_process, to_remove, changes } = detect_changes(
		all_sections,
		existing_data,
		options.force,
	);

	// Display changes
	console.log('\n📊 Change Summary:');
	const new_count = changes.filter((c) => c.change_type === 'new').length;
	const updated_count = changes.filter((c) => c.change_type === 'updated').length;
	const removed_count = changes.filter((c) => c.change_type === 'removed').length;

	console.log(`  ✨ New sections: ${new_count}`);
	console.log(`  🔄 Updated sections: ${updated_count}`);
	console.log(`  ❌ Removed sections: ${removed_count}`);
	console.log(`  📝 To process: ${to_process.length}`);

	if (changes.length > 0) {
		console.log('\n📋 Detailed changes:');
		for (const change of changes) {
			const emoji =
				change.change_type === 'new' ? '  ✨' : change.change_type === 'updated' ? '  🔄' : '  ❌';
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

		// Fetch content for sections to process
		console.log('\n📥 Downloading section content...');
		const sections_with_content: Array<{
			section: (typeof sections_to_process)[number];
			content: string;
			index: number;
		}> = [];
		const download_errors: Array<{ section: string; error: string }> = [];

		for (let i = 0; i < sections_to_process.length; i++) {
			const section = sections_to_process[i]!;
			try {
				console.log(`  Fetching ${i + 1}/${sections_to_process.length}: ${section.title}`);
				const content = await fetch_section_content(section.url);
				sections_with_content.push({
					section,
					content,
					index: i,
				});
			} catch (error) {
				const error_msg = error instanceof Error ? error.message : String(error);
				console.error(`  ⚠️  Failed to fetch ${section.title}:`, error_msg);
				download_errors.push({ section: section.title, error: error_msg });
			}
		}

		console.log(`✅ Successfully downloaded ${sections_with_content.length} sections`);

		if (sections_with_content.length === 0 && to_remove.length === 0) {
			console.error('❌ No sections were successfully downloaded and nothing to remove');
			process.exit(1);
		}

		// Process with Anthropic API if we have content
		const new_summaries: Record<string, string> = {};

		if (sections_with_content.length > 0) {
			console.log('\n🤖 Initializing Anthropic API...');
			const anthropic = new AnthropicProvider('claude-sonnet-4-5-20250929', api_key);

			// Prepare batch requests
			console.log('📦 Preparing batch requests...');
			const batch_requests: AnthropicBatchRequest[] = sections_with_content.map(
				({ content, index }) => ({
					custom_id: `section-${index}`,
					params: {
						model: anthropic.get_model_identifier(),
						max_tokens: 250,
						messages: [
							{
								role: 'user',
								content: USE_CASES_PROMPT + content,
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
			const errors: Array<{ section: string; error: string }> = [];

			for (const result of results) {
				const index = parseInt(result.custom_id.split('-')[1] ?? '0');
				const section_data = sections_with_content.find((s) => s.index === index);

				if (!section_data) {
					console.warn(`  ⚠️  Could not find section for index ${index}`);
					continue;
				}

				const { section } = section_data;

				if (result.result.type !== 'succeeded' || !result.result.message) {
					const error_msg = result.result.error?.message || 'Failed or no message';
					console.error(`  ❌ ${section.title}: ${error_msg}`);
					errors.push({ section: section.title, error: error_msg });
					continue;
				}

				const output_content = result.result.message.content[0]?.text;
				if (output_content) {
					new_summaries[section.slug] = output_content.trim();
					console.log(`  ✅ ${section.title}`);
				}
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

		// Remove deleted sections
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
			failed_summaries:
				sections_with_content.length > 0
					? sections_with_content.length - Object.keys(new_summaries).length
					: 0,
			summaries: merged_summaries,
			errors:
				download_errors.length > 0 || sections_with_content.length > 0
					? download_errors
					: undefined,
			download_errors: download_errors.length > 0 ? download_errors : undefined,
		};

		await writeFile(output_path, JSON.stringify(summary_data, null, 2), 'utf-8');

		// Print summary
		console.log('\n📊 Final Summary:');
		console.log(`  Total sections in API: ${all_sections.length}`);
		console.log(`  Sections processed: ${sections_with_content.length}`);
		console.log(`  New summaries generated: ${Object.keys(new_summaries).length}`);
		console.log(`  Sections removed: ${to_remove.length}`);
		console.log(`  Total summaries in file: ${Object.keys(merged_summaries).length}`);
		console.log(`\n✅ Results written to: ${output_path}`);

		if (download_errors.length > 0) {
			console.log('\n⚠️  Some sections failed to download:');
			download_errors.forEach((e) => console.log(`  - ${e.section}: ${e.error}`));
		}
	}
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
