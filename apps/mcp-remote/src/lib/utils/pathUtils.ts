/**
 * Unified path utilities for handling documentation paths
 */

/**
 * Clean a path by removing the "apps/svelte.dev/content/" prefix
 * This is used to convert database paths to display paths
 *
 * @param path - The path to clean
 * @returns The cleaned path
 */
export function cleanDocumentationPath(path: string): string {
	const prefix = 'apps/svelte.dev/content/';
	if (path.startsWith(prefix)) {
		return path.substring(prefix.length);
	}
	return path;
}

/**
 * Clean a tarball path by removing the repository directory prefix (first segment)
 * This is used when processing files from GitHub tarballs
 *
 * @param path - The path to clean
 * @returns The cleaned path without the repo directory prefix
 */
export function cleanTarballPath(path: string): string {
	// Remove only the repo directory prefix (first segment)
	return path.split('/').slice(1).join('/');
}

/**
 * Extract the title from a file path by removing prefixes and file extensions
 *
 * @param filePath - The file path to extract title from
 * @returns The extracted title
 */
export function extractTitleFromPath(filePath: string): string {
	if (!filePath) {
		return '';
	}

	const pathParts = filePath.split('/');
	const filename = pathParts[pathParts.length - 1];

	// Handle empty filename (e.g., paths ending with '/')
	if (!filename) {
		return '';
	}

	// Remove .md extension and numbered prefixes
	return filename.replace('.md', '').replace(/^\d+-/, '');
}

/**
 * Remove frontmatter from markdown content using a tokenizer approach
 * Frontmatter is YAML metadata at the beginning of files between --- delimiters
 *
 * @param content - The markdown content that may contain frontmatter
 * @returns The content with frontmatter removed
 */
export function removeFrontmatter(content: string): string {
	if (!content || content.length === 0) {
		return content;
	}

	// Check if content starts with frontmatter delimiter
	if (!content.startsWith('---\n')) {
		return content;
	}

	let position = 4; // Start after the opening "---\n"
	let insideFrontmatter = true;
	let frontmatterEndOffset: number | null = null;

	// Traverse the string character by character
	while (position < content.length && insideFrontmatter) {
		const char = content[position];

		// Look for potential end of frontmatter: \n---
		if (char === '\n' && position + 3 < content.length) {
			const nextThree = content.substring(position + 1, position + 4);
			if (nextThree === '---') {
				// Check what comes after the closing ---
				const afterClosing = position + 4;

				if (afterClosing >= content.length) {
					// End of string - this is valid frontmatter
					frontmatterEndOffset = content.length;
					insideFrontmatter = false;
				} else if (content[afterClosing] === '\n') {
					// Followed by newline - this is valid frontmatter
					frontmatterEndOffset = afterClosing + 1;
					insideFrontmatter = false;
				}
				// If followed by something else, it's not the end delimiter, continue searching
			}
		}

		position++;
	}

	// If we never found the end of frontmatter, it's malformed
	if (frontmatterEndOffset === null) {
		return content;
	}

	// Return content after the frontmatter, trimmed
	return content.substring(frontmatterEndOffset).trim();
}
