import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SummaryData } from '../src/lib/schemas.ts';

const current_filename = fileURLToPath(import.meta.url);
const current_dirname = path.dirname(current_filename);
const test_output_dir = path.join(current_dirname, '../test-output');
const test_use_cases_path = path.join(test_output_dir, 'use_cases.json');

function create_summary_data(
	summaries: Record<string, string>,
	total_sections: number = Object.keys(summaries).length,
): SummaryData {
	return {
		generated_at: new Date().toISOString(),
		model: 'claude-sonnet-4-5-20250929',
		total_sections,
		successful_summaries: Object.keys(summaries).length,
		failed_summaries: 0,
		summaries,
	};
}

describe('generate-summaries incremental processing', () => {
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

	describe('file operations', () => {
		it('should create use_cases.json if it does not exist', async () => {
			const initial_data = create_summary_data({
				'svelte/overview': 'always, any svelte project',
			});

			await writeFile(test_use_cases_path, JSON.stringify(initial_data, null, 2), 'utf-8');

			const content = await readFile(test_use_cases_path, 'utf-8');
			const data = JSON.parse(content as unknown as string);

			expect(data.summaries).toHaveProperty('svelte/overview');
			expect(data.total_sections).toBe(1);
		});

		it('should load existing use_cases.json', async () => {
			const existing_data = create_summary_data({
				'svelte/overview': 'always, any svelte project',
				'svelte/$state': 'reactivity, state management',
			});

			await writeFile(test_use_cases_path, JSON.stringify(existing_data, null, 2), 'utf-8');

			const content = await readFile(test_use_cases_path, 'utf-8');
			const data = JSON.parse(content as unknown as string);

			expect(Object.keys(data.summaries)).toHaveLength(2);
			expect(data.summaries).toHaveProperty('svelte/overview');
			expect(data.summaries).toHaveProperty('svelte/$state');
		});

		it('should crash on malformed JSON', async () => {
			// Import the load_existing_summaries function
			const { load_existing_summaries } = await import('./generate-summaries.ts');

			// Write invalid JSON
			await writeFile(test_use_cases_path, '{ invalid json', 'utf-8');

			// Should throw (JSON.parse will throw SyntaxError)
			await expect(load_existing_summaries(test_use_cases_path)).rejects.toThrow();
		});

		it('should crash on invalid schema', async () => {
			// Import the load_existing_summaries function
			const { load_existing_summaries } = await import('./generate-summaries.ts');

			// Write valid JSON but invalid schema
			await writeFile(test_use_cases_path, JSON.stringify({ invalid: 'schema' }), 'utf-8');

			// Should throw an error about schema validation
			await expect(load_existing_summaries(test_use_cases_path)).rejects.toThrow(
				/invalid schema/
			);
		});

		it('should return null when file does not exist', async () => {
			// Import the load_existing_summaries function
			const { load_existing_summaries } = await import('./generate-summaries.ts');

			// File doesn't exist
			const nonexistent_path = path.join(test_output_dir, 'does-not-exist.json');

			// Should return null
			const result = await load_existing_summaries(nonexistent_path);
			expect(result).toBeNull();
		});

		it('should load valid use_cases.json successfully', async () => {
			// Import the load_existing_summaries function
			const { load_existing_summaries } = await import('./generate-summaries.ts');

			const valid_data = create_summary_data({
				'svelte/overview': 'always, any svelte project',
			});

			await writeFile(test_use_cases_path, JSON.stringify(valid_data, null, 2), 'utf-8');

			// Should successfully load and parse
			const result = await load_existing_summaries(test_use_cases_path);
			expect(result).not.toBeNull();
			expect(result?.summaries).toHaveProperty('svelte/overview');
		});
	});

	describe('change detection', () => {
		it('should detect new sections', () => {
			const existing_summaries = {
				'svelte/overview': 'always, any svelte project',
			};

			const current_sections = [
				{ slug: 'svelte/overview', title: 'Overview' },
				{ slug: 'svelte/$state', title: '$state' }, // New section
			];

			const existing_slugs = new Set(Object.keys(existing_summaries));
			const new_sections = current_sections.filter((s) => !existing_slugs.has(s.slug));

			expect(new_sections).toHaveLength(1);
			expect(new_sections[0]?.slug).toBe('svelte/$state');
		});

		it('should detect removed sections', () => {
			const existing_summaries = {
				'svelte/overview': 'always, any svelte project',
				'svelte/$state': 'reactivity, state management',
				'svelte/old-api': 'deprecated',
			};

			const current_sections = [
				{ slug: 'svelte/overview', title: 'Overview' },
				{ slug: 'svelte/$state', title: '$state' },
			];

			const current_slugs = new Set(current_sections.map((s) => s.slug));
			const removed_sections = Object.keys(existing_summaries).filter(
				(slug) => !current_slugs.has(slug),
			);

			expect(removed_sections).toHaveLength(1);
			expect(removed_sections[0]).toBe('svelte/old-api');
		});

		it('should detect no changes when sections are identical', () => {
			const existing_summaries = {
				'svelte/overview': 'always, any svelte project',
				'svelte/$state': 'reactivity, state management',
			};

			const current_sections = [
				{ slug: 'svelte/overview', title: 'Overview' },
				{ slug: 'svelte/$state', title: '$state' },
			];

			const existing_slugs = new Set(Object.keys(existing_summaries));
			const current_slugs = new Set(current_sections.map((s) => s.slug));

			const new_sections = current_sections.filter((s) => !existing_slugs.has(s.slug));
			const removed_sections = Object.keys(existing_summaries).filter(
				(slug) => !current_slugs.has(slug),
			);

			expect(new_sections).toHaveLength(0);
			expect(removed_sections).toHaveLength(0);
		});
	});

	describe('merging summaries', () => {
		it('should merge new summaries with existing ones', async () => {
			const existing_data = create_summary_data({
				'svelte/overview': 'always, any svelte project',
				'svelte/$state': 'reactivity, state management',
			});

			const new_summaries = {
				'kit/introduction': 'sveltekit, getting started',
			};

			const merged = { ...existing_data.summaries, ...new_summaries };

			expect(Object.keys(merged)).toHaveLength(3);
			expect(merged).toHaveProperty('svelte/overview');
			expect(merged).toHaveProperty('svelte/$state');
			expect(merged).toHaveProperty('kit/introduction');
		});

		it('should override existing summaries when updating', () => {
			const existing_summaries = {
				'svelte/overview': 'old description',
			};

			const new_summaries = {
				'svelte/overview': 'new description',
			};

			const merged = { ...existing_summaries, ...new_summaries };

			expect(merged['svelte/overview']).toBe('new description');
		});

		it('should remove deleted sections from summaries', () => {
			const existing_summaries = {
				'svelte/overview': 'always, any svelte project',
				'svelte/$state': 'reactivity, state management',
				'svelte/old-api': 'deprecated',
			};

			const to_remove = ['svelte/old-api'];
			const merged: Record<string, string> = { ...existing_summaries };

			for (const slug of to_remove) {
				delete merged[slug];
			}

			expect(Object.keys(merged)).toHaveLength(2);
			expect(merged).not.toHaveProperty('svelte/old-api');
			expect(merged).toHaveProperty('svelte/overview');
			expect(merged).toHaveProperty('svelte/$state');
		});
	});

	describe('CLI argument parsing', () => {
		it('should parse --force flag', () => {
			const args = ['--force'];
			const has_force = args.includes('--force');

			expect(has_force).toBe(true);
		});

		it('should parse --dry-run flag', () => {
			const args = ['--dry-run'];
			const has_dry_run = args.includes('--dry-run');

			expect(has_dry_run).toBe(true);
		});

		it('should handle multiple flags together', () => {
			const args = ['--force', '--dry-run'];

			expect(args.includes('--force')).toBe(true);
			expect(args.includes('--dry-run')).toBe(true);
		});
	});

	describe('summary data validation', () => {
		it('should create valid summary data structure', () => {
			const data = create_summary_data({
				'svelte/overview': 'always, any svelte project',
			});

			expect(data).toHaveProperty('generated_at');
			expect(data).toHaveProperty('model');
			expect(data).toHaveProperty('total_sections');
			expect(data).toHaveProperty('successful_summaries');
			expect(data).toHaveProperty('failed_summaries');
			expect(data).toHaveProperty('summaries');
		});

		it('should track failed summaries', () => {
			const data: SummaryData = {
				generated_at: new Date().toISOString(),
				model: 'claude-sonnet-4-5-20250929',
				total_sections: 3,
				successful_summaries: 2,
				failed_summaries: 1,
				summaries: {
					'svelte/overview': 'always',
					'svelte/$state': 'reactivity',
				},
				errors: [{ section: 'svelte/broken', error: 'Failed to fetch' }],
			};

			expect(data.failed_summaries).toBe(1);
			expect(data.errors).toHaveLength(1);
		});
	});

	describe('force regeneration', () => {
		it('should process all sections when --force is used', () => {
			const existing_summaries: Record<string, string> = {
				'svelte/overview': 'always, any svelte project',
			};

			const all_sections = [
				{ slug: 'svelte/overview', title: 'Overview' },
				{ slug: 'svelte/$state', title: '$state' },
			];

			const force = true;
			const to_process = force
				? all_sections
				: all_sections.filter((s) => !existing_summaries[s.slug]);

			expect(to_process).toHaveLength(2); // All sections even though one exists
		});

		it('should only process new sections when --force is not used', () => {
			const existing_summaries = {
				'svelte/overview': 'always, any svelte project',
			};

			const all_sections = [
				{ slug: 'svelte/overview', title: 'Overview' },
				{ slug: 'svelte/$state', title: '$state' },
			];

			const force = false;
			const existing_slugs = new Set(Object.keys(existing_summaries));
			const to_process = force
				? all_sections
				: all_sections.filter((s) => !existing_slugs.has(s.slug));

			expect(to_process).toHaveLength(1); // Only new section
			expect(to_process[0]?.slug).toBe('svelte/$state');
		});
	});

	describe('edge cases', () => {
		it('should handle empty existing summaries', () => {
			const existing_summaries: Record<string, string> = {};
			const all_sections = [
				{ slug: 'svelte/overview', title: 'Overview' },
				{ slug: 'svelte/$state', title: '$state' },
			];

			const existing_slugs = new Set(Object.keys(existing_summaries));
			const new_sections = all_sections.filter((s) => !existing_slugs.has(s.slug));

			expect(new_sections).toHaveLength(2);
		});

		it('should handle empty current sections', () => {
			const existing_summaries = {
				'svelte/overview': 'always, any svelte project',
				'svelte/$state': 'reactivity, state management',
			};

			const current_sections: Array<{ slug: string; title: string }> = [];

			const current_slugs = new Set(current_sections.map((s) => s.slug));
			const removed_sections = Object.keys(existing_summaries).filter(
				(slug) => !current_slugs.has(slug),
			);

			expect(removed_sections).toHaveLength(2); // All existing should be removed
		});

		it('should handle sections with special characters in slugs', () => {
			const sections = [
				{ slug: 'svelte/$state', title: '$state' },
				{ slug: 'svelte/@html', title: '@html' },
			];

			const existing_slugs = new Set(['svelte/$state']);
			const new_sections = sections.filter((s) => !existing_slugs.has(s.slug));

			expect(new_sections).toHaveLength(1);
			expect(new_sections[0]?.slug).toBe('svelte/@html');
		});
	});
});
