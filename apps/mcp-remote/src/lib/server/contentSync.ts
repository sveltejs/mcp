import {
	fetchRepositoryTarball,
	processMarkdownFromTarball,
	minimizeContent,
} from '$lib/fetchMarkdown';
import { ContentDbService } from '$lib/server/contentDb';
import type { CreateContentInput } from '$lib/types/db';
import { presets, DEFAULT_REPOSITORY } from '$lib/presets';
import { logAlways, logErrorAlways, log } from '$lib/log';

function sortFilesWithinGroup(
	files: Array<{ path: string; content: string }>,
): Array<{ path: string; content: string }> {
	return files.sort((a, b) => {
		const aPath = a.path;
		const bPath = b.path;

		// Check if one path is a parent of the other
		if (bPath.startsWith(aPath.replace('/index.md', '/'))) return -1;
		if (aPath.startsWith(bPath.replace('/index.md', '/'))) return 1;

		return aPath.localeCompare(bPath);
	});
}

export class ContentSyncService {
	static readonly MAX_CONTENT_AGE_MS = 24 * 60 * 60 * 1000;

	static async syncRepository(
		options: {
			returnStats?: boolean;
		} = {},
	): Promise<{
		success: boolean;
		stats: {
			total_files: number;
			total_size_bytes: number;
			last_updated: Date;
		};
		sync_details: {
			upserted_files: number;
			deleted_files: number;
			unchanged_files: number;
		};
		timestamp: string;
	}> {
		const { returnStats = true } = options;
		const { owner, repo: repoName } = DEFAULT_REPOSITORY;

		logAlways(`Starting sync for repository: ${owner}/${repoName}`);

		let upsertedFiles = 0;
		let deletedFiles = 0;
		let unchangedFiles = 0;

		try {
			logAlways(`Step 1: Syncing repository ${owner}/${repoName}`);

			const tarballBuffer = await fetchRepositoryTarball(owner, repoName);

			const filesWithPaths = (await processMarkdownFromTarball(
				tarballBuffer,
				{
					glob: ['**/*.md', '**/*.mdx'],
					ignore: [],
					title: `Sync ${owner}/${repoName}`,
					distilled: false,
				},
				true,
			)) as Array<{
				path: string;
				content: string;
			}>;

			logAlways(`Found ${filesWithPaths.length} markdown files in ${owner}/${repoName}`);

			const existingFiles = await ContentDbService.getAllContent();
			const existingPaths = new Set(existingFiles.map((file) => file.path));

			const foundPaths = new Set(filesWithPaths.map((file) => file.path));

			const contentInputs: CreateContentInput[] = [];

			for (const file of filesWithPaths) {
				const filename = ContentDbService.extractFilename(file.path);
				const sizeBytes = new TextEncoder().encode(file.content).length;

				const metadata = ContentDbService.extractFrontmatter(file.content);

				const hasChanged = await ContentDbService.hasContentChanged(file.path, file.content);

				if (hasChanged) {
					contentInputs.push({
						path: file.path,
						filename,
						content: file.content,
						size_bytes: sizeBytes,
						metadata,
					});
				} else {
					unchangedFiles++;
				}
			}

			if (contentInputs.length > 0) {
				logAlways(`Upserting ${contentInputs.length} changed files`);
				await ContentDbService.batchUpsertContent(contentInputs);
				upsertedFiles = contentInputs.length;
			} else {
				logAlways(`No file content changes detected`);
			}

			// Handle deletions - find files in DB that are no longer in the repository
			const deletedPaths = Array.from(existingPaths).filter((path) => !foundPaths.has(path));

			if (deletedPaths.length > 0) {
				logAlways(`Deleting ${deletedPaths.length} files that no longer exist`);

				for (const deletedPath of deletedPaths) {
					logAlways(`  Deleting: ${deletedPath}`);
					await ContentDbService.deleteContent(deletedPath);
				}
				deletedFiles = deletedPaths.length;
			} else {
				logAlways(`No deleted files detected`);
			}

			let stats;
			if (returnStats) {
				logAlways(`Step 2: Collecting final statistics`);
				stats = await ContentSyncService.getContentStats();
			} else {
				logAlways(`Step 2: Skipping stats collection (returnStats = false)`);
				// Return minimal stats structure
				stats = {
					total_files: 0,
					total_size_bytes: 0,
					last_updated: new Date(),
				};
			}

			logAlways(
				`Sync completed successfully: ${upsertedFiles} upserted, ${deletedFiles} deleted, ${unchangedFiles} unchanged`,
			);

			return {
				success: true,
				stats,
				sync_details: {
					upserted_files: upsertedFiles,
					deleted_files: deletedFiles,
					unchanged_files: unchangedFiles,
				},
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			logErrorAlways(`Failed to sync repository ${owner}/${repoName}:`, error);
			throw error;
		}
	}

	static async isRepositoryContentStale(): Promise<boolean> {
		try {
			const stats = await ContentDbService.getContentStats();

			if (stats.total_files === 0) {
				return true; // No content, consider stale
			}

			const lastUpdated = new Date(stats.last_updated);
			const contentAge = Date.now() - lastUpdated.getTime();

			const isStale = contentAge > ContentSyncService.MAX_CONTENT_AGE_MS;

			if (isStale) {
				logAlways(
					`Repository content is stale (age: ${Math.floor(contentAge / 1000 / 60)} minutes)`,
				);
			}

			return isStale;
		} catch (error) {
			logErrorAlways(`Error checking repository staleness:`, error);
			return true; // On error, assume stale
		}
	}

	static async getPresetContentFromDb(
		presetKey: string,
	): Promise<Array<{ path: string; content: string }> | null> {
		const preset = presets[presetKey];
		if (!preset) {
			return null;
		}

		try {
			const allContent = await ContentDbService.getAllContent();

			if (allContent.length === 0) {
				return null;
			}

			log(`Checking ${allContent.length} files against glob patterns for preset ${presetKey}`);
			log(`Glob patterns: ${JSON.stringify(preset.glob)}`);
			log(`Ignore patterns: ${JSON.stringify(preset.ignore || [])}`);

			const { minimatch } = await import('minimatch');

			const orderedResults: Array<{ path: string; content: string }> = [];

			// Process one glob pattern at a time
			for (const pattern of preset.glob) {
				log(`\nProcessing glob pattern: ${pattern}`);

				const matchingFiles: Array<{ path: string; content: string }> = [];

				for (const dbContent of allContent) {
					const shouldIgnore = preset.ignore?.some((ignorePattern) => {
						const matches = minimatch(dbContent.path, ignorePattern);
						if (matches) {
							log(`  File ${dbContent.path} ignored by pattern: ${ignorePattern}`);
						}
						return matches;
					});
					if (shouldIgnore) continue;

					if (minimatch(dbContent.path, pattern)) {
						log(`  File ${dbContent.path} matched`);

						let processedContent = dbContent.content;
						if (preset.minimize && Object.keys(preset.minimize).length > 0) {
							processedContent = minimizeContent(dbContent.content, preset.minimize);
						}

						matchingFiles.push({
							path: dbContent.path,
							content: processedContent,
						});
					}
				}

				const sortedFiles = sortFilesWithinGroup(matchingFiles);

				log(`  Found ${sortedFiles.length} files for pattern: ${pattern}`);
				sortedFiles.forEach((file, i) => {
					log(`    ${i + 1}. ${file.path}`);
				});

				orderedResults.push(...sortedFiles);
			}

			logAlways(
				`Found ${orderedResults.length} files matching preset ${presetKey} from database in natural glob order`,
			);

			log('\nFinal file order:');
			orderedResults.forEach((file, i) => {
				log(`  ${i + 1}. ${file.path}`);
			});

			return orderedResults;
		} catch (error) {
			logErrorAlways(`Failed to get preset content from database for ${presetKey}:`, error);
			return null;
		}
	}

	static async getContentStats() {
		return ContentDbService.getContentStats();
	}
}
