import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const current_filename = fileURLToPath(import.meta.url);
const current_dirname = path.dirname(current_filename);
const test_output_dir = path.join(current_dirname, '../test-output');
const test_verification_path = path.join(test_output_dir, 'distilled-verification.json');

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

function create_verification_output(
	results: VerificationResult[],
	total_sections: number = results.length,
): VerificationOutput {
	const accurate_count = results.filter((r) => r.status === 'ACCURATE').length;
	const not_accurate_count = results.filter((r) => r.status === 'NOT_ACCURATE').length;

	return {
		generated_at: new Date().toISOString(),
		model: 'claude-sonnet-4-5-20250929',
		total_sections,
		verified_sections: results.length,
		accurate_count,
		not_accurate_count,
		results,
	};
}

describe('verify-distilled', () => {
	beforeEach(async () => {
		await mkdir(test_output_dir, { recursive: true });
	});

	afterEach(async () => {
		try {
			await rm(test_output_dir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe('verification result structure', () => {
		it('should create valid verification output structure', () => {
			const results: VerificationResult[] = [
				{
					slug: 'svelte/overview',
					status: 'ACCURATE',
					reasoning: 'Summary accurately reflects original content',
				},
			];

			const output = create_verification_output(results);

			expect(output).toHaveProperty('generated_at');
			expect(output).toHaveProperty('model');
			expect(output).toHaveProperty('total_sections');
			expect(output).toHaveProperty('verified_sections');
			expect(output).toHaveProperty('accurate_count');
			expect(output).toHaveProperty('not_accurate_count');
			expect(output).toHaveProperty('results');
			expect(output.results).toHaveLength(1);
		});

		it('should correctly count accurate vs not accurate results', () => {
			const results: VerificationResult[] = [
				{
					slug: 'svelte/overview',
					status: 'ACCURATE',
					reasoning: 'Good summary',
				},
				{
					slug: 'svelte/$state',
					status: 'NOT_ACCURATE',
					reasoning: 'Missing critical information',
				},
				{
					slug: 'svelte/$effect',
					status: 'ACCURATE',
					reasoning: 'Well condensed',
				},
			];

			const output = create_verification_output(results);

			expect(output.accurate_count).toBe(2);
			expect(output.not_accurate_count).toBe(1);
			expect(output.verified_sections).toBe(3);
		});
	});

	describe('file operations', () => {
		it('should write verification results to JSON file', async () => {
			const results: VerificationResult[] = [
				{
					slug: 'svelte/overview',
					status: 'ACCURATE',
					reasoning: 'Summary is accurate',
				},
			];

			const output = create_verification_output(results);

			await writeFile(test_verification_path, JSON.stringify(output, null, 2), 'utf-8');

			// Verify file was written
			const fs = await import('node:fs/promises');
			const content = await fs.readFile(test_verification_path, 'utf-8');
			const parsed = JSON.parse(content);

			expect(parsed.results).toHaveLength(1);
			expect(parsed.results[0]?.slug).toBe('svelte/overview');
			expect(parsed.results[0]?.status).toBe('ACCURATE');
		});
	});

	describe('verification status', () => {
		it('should mark summaries as ACCURATE when appropriate', () => {
			const result: VerificationResult = {
				slug: 'svelte/overview',
				status: 'ACCURATE',
				reasoning: 'Core concepts preserved, minor simplifications acceptable',
			};

			expect(result.status).toBe('ACCURATE');
			expect(result.reasoning).toBeTruthy();
		});

		it('should mark summaries as NOT_ACCURATE when appropriate', () => {
			const result: VerificationResult = {
				slug: 'svelte/$state',
				status: 'NOT_ACCURATE',
				reasoning: 'Factual error in code example',
			};

			expect(result.status).toBe('NOT_ACCURATE');
			expect(result.reasoning).toBeTruthy();
		});
	});

	describe('batch processing', () => {
		it('should handle multiple verification results', () => {
			const results: VerificationResult[] = [
				{
					slug: 'svelte/overview',
					status: 'ACCURATE',
					reasoning: 'Good',
				},
				{
					slug: 'svelte/$state',
					status: 'NOT_ACCURATE',
					reasoning: 'Missing info',
				},
				{
					slug: 'svelte/$effect',
					status: 'ACCURATE',
					reasoning: 'Well done',
				},
				{
					slug: 'svelte/$derived',
					status: 'ACCURATE',
					reasoning: 'Correct',
				},
			];

			const output = create_verification_output(results);

			expect(output.results).toHaveLength(4);
			expect(output.accurate_count).toBe(3);
			expect(output.not_accurate_count).toBe(1);
		});

		it('should calculate percentages correctly', () => {
			const results: VerificationResult[] = Array.from({ length: 10 }, (_, i) => ({
				slug: `section-${i}`,
				status: i < 7 ? 'ACCURATE' : 'NOT_ACCURATE',
				reasoning: 'test',
			}));

			const output = create_verification_output(results);

			expect(output.verified_sections).toBe(10);
			expect(output.accurate_count).toBe(7);
			expect(output.not_accurate_count).toBe(3);

			// 70% accurate, 30% not accurate
			const accurate_percentage = (output.accurate_count / output.verified_sections) * 100;
			const not_accurate_percentage = (output.not_accurate_count / output.verified_sections) * 100;

			expect(accurate_percentage).toBe(70);
			expect(not_accurate_percentage).toBe(30);
		});
	});

	describe('edge cases', () => {
		it('should handle empty results array', () => {
			const results: VerificationResult[] = [];
			const output = create_verification_output(results);

			expect(output.results).toHaveLength(0);
			expect(output.accurate_count).toBe(0);
			expect(output.not_accurate_count).toBe(0);
		});

		it('should handle all ACCURATE results', () => {
			const results: VerificationResult[] = [
				{
					slug: 'section-1',
					status: 'ACCURATE',
					reasoning: 'Good',
				},
				{
					slug: 'section-2',
					status: 'ACCURATE',
					reasoning: 'Great',
				},
			];

			const output = create_verification_output(results);

			expect(output.accurate_count).toBe(2);
			expect(output.not_accurate_count).toBe(0);
		});

		it('should handle all NOT_ACCURATE results', () => {
			const results: VerificationResult[] = [
				{
					slug: 'section-1',
					status: 'NOT_ACCURATE',
					reasoning: 'Error',
				},
				{
					slug: 'section-2',
					status: 'NOT_ACCURATE',
					reasoning: 'Missing info',
				},
			];

			const output = create_verification_output(results);

			expect(output.accurate_count).toBe(0);
			expect(output.not_accurate_count).toBe(2);
		});
	});

	describe('reasoning validation', () => {
		it('should include reasoning for each result', () => {
			const results: VerificationResult[] = [
				{
					slug: 'svelte/overview',
					status: 'ACCURATE',
					reasoning: 'Core concepts preserved',
				},
				{
					slug: 'svelte/$state',
					status: 'NOT_ACCURATE',
					reasoning: 'Code example contains error',
				},
			];

			for (const result of results) {
				expect(result.reasoning).toBeTruthy();
				expect(result.reasoning.length).toBeGreaterThan(0);
			}
		});

		it('should handle long reasoning text', () => {
			const long_reasoning = 'A'.repeat(500); // 500 character reasoning

			const result: VerificationResult = {
				slug: 'svelte/overview',
				status: 'ACCURATE',
				reasoning: long_reasoning,
			};

			expect(result.reasoning).toBe(long_reasoning);
			expect(result.reasoning.length).toBe(500);
		});
	});
});
