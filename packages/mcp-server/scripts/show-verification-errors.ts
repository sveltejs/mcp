#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as v from 'valibot';

const current_filename = fileURLToPath(import.meta.url);
const current_dirname = path.dirname(current_filename);

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

async function main() {
	const verification_path = path.join(current_dirname, '../src/distilled-verification.json');

	console.log('📂 Reading verification results...\n');

	let content: string;
	try {
		content = await readFile(verification_path, 'utf-8');
	} catch (error) {
		console.error('❌ Error: Could not find distilled-verification.json');
		console.error('Please run `pnpm verify-distilled` first to generate the file.');
		process.exit(1);
	}

	const data = JSON.parse(content);
	const validated = v.safeParse(verification_output_schema, data);

	if (!validated.success) {
		console.error('❌ Error: Invalid verification file format');
		console.error(JSON.stringify(validated.issues, null, 2));
		process.exit(1);
	}

	const verification_data = validated.output;

	// Filter for NOT_ACCURATE results
	const not_accurate = verification_data.results.filter((r) => r.status === 'NOT_ACCURATE');

	// Print header
	console.log('📊 Verification Results Summary');
	console.log('═'.repeat(80));
	console.log(`Generated: ${new Date(verification_data.generated_at).toLocaleString()}`);
	console.log(`Model: ${verification_data.model}`);
	console.log(`Total Sections: ${verification_data.total_sections}`);
	console.log(`Verified: ${verification_data.verified_sections}`);
	console.log(
		`✅ Accurate: ${verification_data.accurate_count} (${((verification_data.accurate_count / verification_data.verified_sections) * 100).toFixed(1)}%)`,
	);
	console.log(
		`❌ Not Accurate: ${verification_data.not_accurate_count} (${((verification_data.not_accurate_count / verification_data.verified_sections) * 100).toFixed(1)}%)`,
	);
	console.log('═'.repeat(80));

	if (not_accurate.length === 0) {
		console.log('\n🎉 All sections are accurate! No issues found.');
		return;
	}

	// Print all NOT_ACCURATE entries
	console.log(`\n❌ NOT ACCURATE SECTIONS (${not_accurate.length}):\n`);

	for (let i = 0; i < not_accurate.length; i++) {
		const result = not_accurate[i]!;
		console.log(`${i + 1}. ${result.slug}`);
		console.log(`   Reasoning: ${result.reasoning}`);
		console.log('');
	}

	console.log('═'.repeat(80));
	console.log(`\nFound ${not_accurate.length} section(s) that need review or regeneration.`);
}

main().catch((error) => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});
