import { writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

/**
 * Export summaries to markdown files in nested directory structure
 * @param summaries - Record of slug -> content mappings
 * @param type - Type of summaries ('use_cases' or 'distilled')
 * @param base_dir - Base directory for summaries (e.g., 'packages/mcp-server/summaries')
 * @returns Number of files created
 */
export async function export_summaries_to_markdown(
	summaries: Record<string, string>,
	type: 'use_cases' | 'distilled',
	base_dir: string,
): Promise<number> {
	const output_base_dir = path.join(base_dir, type);
	const summary_count = Object.keys(summaries).length;

	console.log(`  📁 Target: summaries/${type}/`);
	console.log(`  📊 Total summaries: ${summary_count}`);

	// Clean existing directory for this type
	console.log(`  🧹 Cleaning ${type} directory...`);
	try {
		await rm(output_base_dir, { recursive: true, force: true });
	} catch {
		// Directory might not exist, that's okay
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
	return created_count;
}
