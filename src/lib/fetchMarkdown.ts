import type { PresetConfig } from '$lib/presets';
import { env } from '$env/dynamic/private';
import tarStream from 'tar-stream';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';
import { minimatch } from 'minimatch';
import { getPresetContent } from './presetCache';
import { CacheDbService } from '$lib/server/cacheDb';
import { log, logAlways, logErrorAlways } from '$lib/log';
import { cleanTarballPath } from '$lib/utils/pathUtils';

let cacheService: CacheDbService | null = null;

function getCacheService(): CacheDbService {
	if (!cacheService) {
		cacheService = new CacheDbService();
	}
	return cacheService;
}

function sortFilesWithinGroup(files: string[]): string[] {
	return files.sort((a, b) => {
		const aPath = a.split('\n')[0].replace('## ', '');
		const bPath = b.split('\n')[0].replace('## ', '');

		// Check if one path is a parent of the other
		if (bPath.startsWith(aPath.replace('/index.md', '/'))) return -1;
		if (aPath.startsWith(bPath.replace('/index.md', '/'))) return 1;

		return aPath.localeCompare(bPath);
	});
}

export async function fetchRepositoryTarball(owner: string, repo: string): Promise<Buffer> {
	const cacheKey = `${owner}/${repo}`;
	const cache = getCacheService();

	const cachedBuffer = await cache.get(cacheKey);
	if (cachedBuffer) {
		logAlways(`Using cached tarball for ${cacheKey} from database`);
		return cachedBuffer;
	}

	const url = `https://api.github.com/repos/${owner}/${repo}/tarball`;

	logAlways(`Fetching tarball from: ${url}`);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${env.GITHUB_TOKEN}`,
			Accept: 'application/vnd.github.v3.raw',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch tarball: ${response.statusText}`);
	}

	if (!response.body) {
		throw new Error('Response body is null');
	}

	const chunks: Uint8Array[] = [];
	const reader = response.body.getReader();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}

	const buffer = Buffer.concat(chunks);

	// Cache the buffer in database with 60 minutes TTL
	await cache.set(cacheKey, buffer, 60);

	return buffer;
}

export async function processMarkdownFromTarball(
	tarballBuffer: Buffer,
	presetConfig: PresetConfig,
	includePathInfo: boolean,
): Promise<string[] | { path: string; content: string }[]> {
	const { glob, ignore = [], minimize = undefined } = presetConfig;

	// Create a Map to store files for each glob pattern while maintaining order
	const globResults = new Map<string, unknown[]>();
	const filePathsByPattern = new Map<string, string[]>();
	glob.forEach((pattern) => {
		globResults.set(pattern, []);
		filePathsByPattern.set(pattern, []);
	});

	const extractStream = tarStream.extract();

	let processedFiles = 0;
	let matchedFiles = 0;

	extractStream.on('entry', (header, stream, next) => {
		processedFiles++;
		let matched = false;

		for (const pattern of glob) {
			if (shouldIncludeFile(header.name, pattern, ignore)) {
				matched = true;
				matchedFiles++;

				if (header.type === 'file') {
					let content = '';
					stream.on('data', (chunk) => (content += chunk.toString()));
					stream.on('end', () => {
						// Use the unified path utility to clean tarball paths
						const cleanPath = cleanTarballPath(header.name);

						const processedContent = minimizeContent(content, minimize);

						if (includePathInfo) {
							const files = globResults.get(pattern) || [];
							files.push({
								path: cleanPath,
								content: processedContent,
							});
							globResults.set(pattern, files);
						} else {
							const contentWithHeader = `## ${cleanPath}\n\n${processedContent}`;

							const files = globResults.get(pattern) || [];
							files.push(contentWithHeader);
							globResults.set(pattern, files);
						}

						const paths = filePathsByPattern.get(pattern) || [];
						paths.push(cleanPath);
						filePathsByPattern.set(pattern, paths);

						next();
					});
					return;
				}
			}
		}

		if (!matched) {
			stream.resume();
			next();
		}
	});

	const tarballStream = Readable.from(tarballBuffer);
	const gunzipStream = createGunzip();

	tarballStream.pipe(gunzipStream).pipe(extractStream);

	await new Promise<void>((resolve) => extractStream.on('finish', resolve));

	logAlways(`Total files processed: ${processedFiles}`);
	logAlways(`Files matching glob: ${matchedFiles}`);
	log('\nFinal file order:');

	glob.forEach((pattern, index) => {
		const paths = filePathsByPattern.get(pattern) || [];
		const sortedPaths = includePathInfo
			? paths
			: sortFilesWithinGroup(paths.map((p) => `## ${p}`)).map((p) => p.replace('## ', ''));

		if (sortedPaths.length > 0) {
			log(`\nGlob pattern ${index + 1}: ${pattern}`);
			sortedPaths.forEach((path, i) => {
				log(`  ${i + 1}. ${path}`);
			});
		}
	});

	// Combine results in the order of glob patterns
	const orderedResults: unknown[] = [];
	for (const pattern of glob) {
		const filesForPattern = globResults.get(pattern) || [];
		if (includePathInfo) {
			orderedResults.push(...filesForPattern);
		} else {
			orderedResults.push(...sortFilesWithinGroup(filesForPattern as string[]));
		}
	}

	return orderedResults as string[] | { path: string; content: string }[];
}

function shouldIncludeFile(filename: string, glob: string, ignore: string[] = []): boolean {
	const shouldIgnore = ignore.some((pattern) => minimatch(filename, pattern));
	if (shouldIgnore) {
		logAlways(`❌ Ignored by pattern: ${filename}`);
		return false;
	}

	return minimatch(filename, glob);
}

export async function clearRepositoryCache(): Promise<void> {
	const cache = getCacheService();
	await cache.clear();
	logAlways('Repository cache cleared');
}

export async function getRepositoryCacheStatus(): Promise<{
	size: number;
	repositories: string[];
	totalSizeBytes: number;
}> {
	const cache = getCacheService();
	const status = await cache.getStatus();
	return {
		size: status.count,
		repositories: status.keys,
		totalSizeBytes: status.totalSizeBytes,
	};
}

export interface MinimizeOptions {
	normalizeWhitespace?: boolean;
	removeLegacy?: boolean;
	removePlaygroundLinks?: boolean;
	removePrettierIgnore?: boolean;
	removeNoteBlocks?: boolean;
	removeDetailsBlocks?: boolean;
	removeHtmlComments?: boolean;
	removeDiffMarkers?: boolean;
}

const defaultOptions: MinimizeOptions = {
	normalizeWhitespace: false,
	removeLegacy: false,
	removePlaygroundLinks: false,
	removePrettierIgnore: true,
	removeNoteBlocks: true,
	removeDetailsBlocks: true,
	removeHtmlComments: false,
	removeDiffMarkers: true,
};

function removeQuoteBlocks(content: string, blockType: string): string {
	return content
		.split('\n')
		.reduce((acc: string[], line: string, index: number, lines: string[]) => {
			// If we find a block (with or without additional text), skip it and all subsequent blockquote lines
			if (line.trim().startsWith(`> [!${blockType}]`)) {
				// Skip all subsequent lines that are part of the blockquote
				let i = index;
				while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
					i++;
				}
				// Update the index to skip all these lines
				index = i - 1;
				return acc;
			}

			acc.push(line);
			return acc;
		}, [])
		.join('\n');
}

function removeDiffMarkersFromContent(content: string): string {
	let inCodeBlock = false;
	const lines = content.split('\n');
	const processedLines = lines.map((line) => {
		// Track if we're entering or leaving a code block
		// eslint-disable-next-line no-useless-escape
		if (line.trim().startsWith('\`\`\`')) {
			inCodeBlock = !inCodeBlock;
			return line;
		}

		if (inCodeBlock) {
			// Handle lines that end with --- or +++ with possible whitespace after
			// eslint-disable-next-line no-useless-escape
			line = line.replace(/(\+{3}|\-{3})[\s]*$/g, '');

			// Handle triple markers at start while preserving indentation
			// This captures the whitespace before the marker and adds it back
			// eslint-disable-next-line no-useless-escape
			line = line.replace(/^(\s*)(\+{3}|\-{3})\s*/g, '$1');

			// Handle single + or - markers at start while preserving indentation
			// eslint-disable-next-line no-useless-escape
			line = line.replace(/^(\s*)[\+\-](\s)/g, '$1');

			// Handle multi-line diff blocks where --- or +++ might be in the middle of line
			// eslint-disable-next-line no-useless-escape
			line = line.replace(/[\s]*(\+{3}|\-{3})[\s]*/g, '');
		}

		return line;
	});

	return processedLines.join('\n');
}

export function minimizeContent(content: string, options?: Partial<MinimizeOptions>): string {
	const settings: MinimizeOptions = options ? { ...defaultOptions, ...options } : defaultOptions;

	let minimized = content;

	minimized = minimized.replace(/NOTE: do not edit this file, it is generated in.*$/gm, '');

	if (settings.removeDiffMarkers) {
		minimized = removeDiffMarkersFromContent(minimized);
	}

	if (settings.removeLegacy) {
		minimized = removeQuoteBlocks(minimized, 'LEGACY');
	}

	if (settings.removeNoteBlocks) {
		minimized = removeQuoteBlocks(minimized, 'NOTE');
	}

	if (settings.removeDetailsBlocks) {
		minimized = removeQuoteBlocks(minimized, 'DETAILS');
	}

	if (settings.removePlaygroundLinks) {
		// Replace playground URLs with /[link] but keep the original link text
		minimized = minimized.replace(/\[([^\]]+)\]\(\/playground[^)]+\)/g, '[$1](/REMOVED)');
	}

	if (settings.removePrettierIgnore) {
		minimized = minimized
			.split('\n')
			.filter((line) => line.trim() !== '<!-- prettier-ignore -->')
			.join('\n');
	}

	if (settings.removeHtmlComments) {
		// Replace all HTML comments (including multi-line) with empty string
		minimized = minimized.replace(/<!--[\s\S]*?-->/g, '');
	}

	if (settings.normalizeWhitespace) {
		minimized = minimized.replace(/\s+/g, ' ');
	}

	minimized = minimized.trim();

	return minimized;
}
