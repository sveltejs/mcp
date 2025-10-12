#!/usr/bin/env node
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { AnthropicProvider } from '../src/lib/anthropic.ts';
import type { AnthropicBatchRequest } from '../src/lib/schemas.ts';
import distilled_data from '../src/distilled.json' with { type: 'json' };
import * as v from 'valibot';

interface CliOptions {
	dryRun: boolean;
	debug: boolean;
}

interface VerificationResult {
	slug: string;
	status: 'ACCURATE' | 'NOT_ACCURATE';
	reasoning: string;
}

interface VerificationOutput {
	generated_at: string;
	model: string;
	total_sections: number;
	verified_sections: number;
	accurate_count: number;
	not_accurate_count: number;
	results: VerificationResult[];
}

const current_filename = fileURLToPath(import.meta.url);
const current_dirname = path.dirname(current_filename);

const verification_output_schema = v.object({
	generated_at: v.string(),
	model: v.string(),
	total_sections: v.number(),
	verified_sections: v.number(),
	accurate_count: v.number(),
	not_accurate_count: v.number(),
	results: v.array(
		v.object({
			slug: v.string(),
			status: v.union([v.literal('ACCURATE'), v.literal('NOT_ACCURATE')]),
			reasoning: v.string(),
		}),
	),
});

const program = new Command();

program
	.name('verify-distilled')
	.description(
		'Verify the accuracy of distilled summaries by comparing them to original documentation',
	)
	.version('1.0.0')
	.option('-d, --dry-run', 'Show what would be verified without making API calls', false)
	.option('--debug', 'Debug mode: process only 2 sections', false);

const VERIFICATION_PROMPT = `You are tasked with verifying the accuracy of a distilled/condensed version of documentation against the original content.

Your task:
1. Read both the ORIGINAL documentation and the DISTILLED version provided below
2. Determine if the distilled version accurately represents the key information from the original
3. Check for any factual errors, misleading statements, or critical omissions
4. Return your verdict as either "ACCURATE" or "NOT_ACCURATE"

Guidelines for determining accuracy:
- ACCURATE: The distilled version correctly captures the essential information, even if shortened
- ACCURATE: Minor formatting changes or reasonable simplifications are acceptable
- ACCURATE: Examples may be condensed as long as the core concept is preserved
- NOT_ACCURATE: Any factual errors or contradictions with the original
- NOT_ACCURATE: Missing critical information that would mislead developers
- NOT_ACCURATE: Incorrect code examples or API usage

You must respond in the following JSON format ONLY:
{
  "status": "ACCURATE" or "NOT_ACCURATE",
  "reasoning": "Brief explanation of your decision (max 200 characters)"
}

Do not include any other text in your response, only the JSON object.`;

async function main() {
	program.parse();
	const options = program.opts<CliOptions>();

	const debug = options.debug || process.env.DEBUG_MODE === '1';

	console.log('🔍 Starting distilled verification...\n');

	if (options.dryRun) {
		console.log('🔍 DRY RUN MODE - No API calls will be made\n');
	}
	if (debug) {
		console.log('🐛 DEBUG MODE - Will process only 2 sections\n');
	}

	const output_path = path.join(current_dirname, '../src/distilled-verification.json');

	// Load distilled data
	console.log('📂 Loading distilled.json...');
	const { summaries, content } = distilled_data;

	const sections_to_verify = Object.keys(summaries);
	console.log(`Found ${sections_to_verify.length} sections to verify`);

	// Debug mode: limit to 2 sections
	let sections = sections_to_verify;
	if (debug) {
		console.log('\n🐛 Processing only 2 sections for debugging');
		sections = sections_to_verify.slice(0, 2);
	}

	console.log(`\n📋 Will verify ${sections.length} sections:`);
	for (const slug of sections) {
		console.log(`  - ${slug}`);
	}

	// Dry run mode: exit before API calls
	if (options.dryRun) {
		console.log('\n🔍 DRY RUN complete - no changes were made');
		console.log(`Would have verified ${sections.length} sections`);
		return;
	}

	// Check for API key
	const api_key = process.env.ANTHROPIC_API_KEY;
	if (!api_key) {
		console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
		console.error('Please set it in packages/mcp-server/.env file or export it:');
		console.error('export ANTHROPIC_API_KEY=your_api_key_here');
		process.exit(1);
	}

	// Initialize Anthropic API
	console.log('\n🤖 Initializing Anthropic API...');
	const anthropic = new AnthropicProvider('claude-sonnet-4-5-20250929', api_key);

	// Prepare batch requests
	console.log('📦 Preparing batch requests...');
	const batch_requests: AnthropicBatchRequest[] = sections.map((slug, index) => {
		const original = content[slug] || '';
		const distilled = summaries[slug] || '';

		return {
			custom_id: `verify-${index}`,
			params: {
				model: anthropic.get_model_identifier(),
				max_tokens: 1024,
				messages: [
					{
						role: 'user',
						content:
							`${VERIFICATION_PROMPT}\n\n` +
							`<original>${original}</original>\n\n` +
							`<distilled>${distilled}</distilled>`,
					},
				],
				temperature: 0,
			},
		};
	});

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
	const verification_results: VerificationResult[] = [];

	for (const result of results) {
		const index = parseInt(result.custom_id.split('-')[1] ?? '0');
		const slug = sections[index];

		if (!slug) {
			throw new Error(`Could not find slug for index ${index}`);
		}

		if (result.result.type !== 'succeeded' || !result.result.message) {
			const error_msg = result.result.error?.message || 'Failed or no message';
			console.error(`  ❌ Failed to verify ${slug}: ${error_msg}`);
			verification_results.push({
				slug,
				status: 'NOT_ACCURATE',
				reasoning: `Verification failed: ${error_msg}`,
			});
			continue;
		}

		const output_content = result.result.message.content[0]?.text;
		if (!output_content) {
			console.error(`  ❌ No text content in result for ${slug}`);
			verification_results.push({
				slug,
				status: 'NOT_ACCURATE',
				reasoning: 'No response from verification',
			});
			continue;
		}

		try {
			// Parse the JSON response
			const parsed = JSON.parse(output_content.trim());
			const status = parsed.status as 'ACCURATE' | 'NOT_ACCURATE';
			const reasoning = parsed.reasoning as string;

			verification_results.push({
				slug,
				status,
				reasoning,
			});

			const emoji = status === 'ACCURATE' ? '✅' : '❌';
			console.log(`  ${emoji} ${slug}: ${status}`);
		} catch (error) {
			console.error(`  ❌ Failed to parse response for ${slug}:`, error);
			console.error(`  Raw response: ${output_content}`);
			verification_results.push({
				slug,
				status: 'NOT_ACCURATE',
				reasoning: `Failed to parse verification response: ${output_content.slice(0, 100)}`,
			});
		}
	}

	// Calculate statistics
	const accurate_count = verification_results.filter((r) => r.status === 'ACCURATE').length;
	const not_accurate_count = verification_results.filter((r) => r.status === 'NOT_ACCURATE').length;

	// Write output
	console.log('\n💾 Writing results to file...');
	const output_dir = path.dirname(output_path);
	await mkdir(output_dir, { recursive: true });

	const output_data: VerificationOutput = {
		generated_at: new Date().toISOString(),
		model: 'claude-sonnet-4-5-20250929',
		total_sections: sections_to_verify.length,
		verified_sections: sections.length,
		accurate_count,
		not_accurate_count,
		results: verification_results,
	};

	// Validate output before writing
	const validated = v.safeParse(verification_output_schema, output_data);
	if (!validated.success) {
		throw new Error(
			`Output validation failed: ${JSON.stringify(validated.issues, null, 2)}`,
		);
	}

	await writeFile(output_path, JSON.stringify(output_data, null, 2), 'utf-8');

	// Print summary
	console.log('\n📊 Verification Summary:');
	console.log(`  Total sections: ${sections_to_verify.length}`);
	console.log(`  Verified sections: ${sections.length}`);
	console.log(`  ✅ Accurate: ${accurate_count} (${((accurate_count / sections.length) * 100).toFixed(1)}%)`);
	console.log(
		`  ❌ Not Accurate: ${not_accurate_count} (${((not_accurate_count / sections.length) * 100).toFixed(1)}%)`,
	);

	if (not_accurate_count > 0) {
		console.log('\n⚠️  Sections with issues:');
		verification_results
			.filter((r) => r.status === 'NOT_ACCURATE')
			.forEach((r) => {
				console.log(`  - ${r.slug}: ${r.reasoning}`);
			});
	}

	console.log(`\n✅ Results written to: ${output_path}`);
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
