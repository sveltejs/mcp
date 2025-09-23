import { describe, it, expect } from 'vitest';
import {
	cleanDocumentationPath,
	cleanTarballPath,
	extractTitleFromPath,
	removeFrontmatter,
} from './pathUtils.js';

describe('pathUtils', () => {
	describe('cleanDocumentationPath', () => {
		it('should remove apps/svelte.dev/content/ prefix', () => {
			const input = 'apps/svelte.dev/content/docs/svelte/01-introduction.md';
			const expected = 'docs/svelte/01-introduction.md';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});

		it('should handle paths without the prefix', () => {
			const input = 'docs/svelte/01-introduction.md';
			const expected = 'docs/svelte/01-introduction.md';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});

		it('should handle empty string', () => {
			const input = '';
			const expected = '';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});

		it('should handle partial prefix matches', () => {
			const input = 'apps/svelte.dev/content-extra/docs/svelte/01-introduction.md';
			const expected = 'apps/svelte.dev/content-extra/docs/svelte/01-introduction.md';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});

		it('should handle paths with similar but different prefixes', () => {
			const input = 'apps/svelte.dev/contents/docs/svelte/01-introduction.md';
			const expected = 'apps/svelte.dev/contents/docs/svelte/01-introduction.md';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});

		it('should handle SvelteKit documentation paths', () => {
			const input = 'apps/svelte.dev/content/docs/kit/01-routing.md';
			const expected = 'docs/kit/01-routing.md';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});

		it('should handle tutorial paths', () => {
			const input = 'apps/svelte.dev/content/tutorial/01-introduction/01-hello-world.md';
			const expected = 'tutorial/01-introduction/01-hello-world.md';
			expect(cleanDocumentationPath(input)).toBe(expected);
		});
	});

	describe('cleanTarballPath', () => {
		it('should remove the first segment from tarball paths', () => {
			const input = 'svelte.dev-main/apps/svelte.dev/content/docs/svelte/01-introduction.md';
			const expected = 'apps/svelte.dev/content/docs/svelte/01-introduction.md';
			expect(cleanTarballPath(input)).toBe(expected);
		});

		it('should handle paths with different repo prefixes', () => {
			const input = 'svelte-12345/apps/svelte.dev/content/docs/kit/01-routing.md';
			const expected = 'apps/svelte.dev/content/docs/kit/01-routing.md';
			expect(cleanTarballPath(input)).toBe(expected);
		});

		it('should handle single segment paths', () => {
			const input = 'single-segment';
			const expected = '';
			expect(cleanTarballPath(input)).toBe(expected);
		});

		it('should handle empty string', () => {
			const input = '';
			const expected = '';
			expect(cleanTarballPath(input)).toBe(expected);
		});

		it('should handle paths with no segments', () => {
			const input = 'just-filename.md';
			const expected = '';
			expect(cleanTarballPath(input)).toBe(expected);
		});

		it('should handle complex nested paths', () => {
			const input = 'repo-name/very/deep/nested/path/to/file.md';
			const expected = 'very/deep/nested/path/to/file.md';
			expect(cleanTarballPath(input)).toBe(expected);
		});
	});

	describe('extractTitleFromPath', () => {
		it('should extract filename and remove .md extension and numbered prefix', () => {
			const input = 'docs/svelte/01-introduction.md';
			const expected = 'introduction';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should remove numbered prefixes', () => {
			const input = 'docs/svelte/01-introduction.md';
			const expected = 'introduction';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle files without numbered prefixes', () => {
			const input = 'docs/svelte/reactivity.md';
			const expected = 'reactivity';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle files without .md extension', () => {
			const input = 'docs/svelte/01-introduction';
			const expected = 'introduction';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle complex numbered prefixes', () => {
			const input = 'docs/svelte/99-advanced-topics.md';
			const expected = 'advanced-topics';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle files with multiple numbered prefixes', () => {
			const input = 'docs/svelte/01-02-nested-numbering.md';
			const expected = '02-nested-numbering';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle just a filename', () => {
			const input = '01-introduction.md';
			const expected = 'introduction';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle empty string', () => {
			const input = '';
			const expected = '';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle paths with no filename', () => {
			const input = 'docs/svelte/';
			const expected = '';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle files with hyphens but no numbers', () => {
			const input = 'docs/svelte/state-management.md';
			const expected = 'state-management';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle files with numbers in the middle', () => {
			const input = 'docs/svelte/svelte5-features.md';
			const expected = 'svelte5-features';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle tutorial paths', () => {
			const input = 'tutorial/01-introduction/01-hello-world.md';
			const expected = 'hello-world';
			expect(extractTitleFromPath(input)).toBe(expected);
		});

		it('should handle SvelteKit paths', () => {
			const input = 'docs/kit/01-routing.md';
			const expected = 'routing';
			expect(extractTitleFromPath(input)).toBe(expected);
		});
	});

	describe('removeFrontmatter', () => {
		it('should remove valid frontmatter from content', () => {
			const input = `---
title: Introduction
description: Getting started guide
---

# Introduction

This is the main content.`;
			const expected = `# Introduction

This is the main content.`;
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle content without frontmatter', () => {
			const input = `# Introduction

This is content without frontmatter.`;
			const expected = `# Introduction

This is content without frontmatter.`;
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle empty content', () => {
			const input = '';
			const expected = '';
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle malformed frontmatter (no closing delimiter)', () => {
			const input = `---
title: Introduction
This is malformed frontmatter without closing delimiter

# Content here`;
			const expected = input; // Should return original content unchanged
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle frontmatter with complex YAML', () => {
			const input = `---
title: Complex Example
tags:
  - svelte
  - tutorial
metadata:
  author: John Doe
  date: 2024-01-15
---

# Complex Example

Content with complex frontmatter.`;
			const expected = `# Complex Example

Content with complex frontmatter.`;
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle content that starts with --- but is not frontmatter', () => {
			const input = `---
This is not YAML frontmatter, just content that starts with ---`;
			const expected = input; // Should return original content unchanged
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle frontmatter with empty lines', () => {
			const input = `---
title: Introduction

description: A guide
---

# Content`;
			const expected = `# Content`;
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should trim whitespace after removing frontmatter', () => {
			const input = `---
title: Introduction
---


# Content with leading whitespace`;
			const expected = `# Content with leading whitespace`;
			expect(removeFrontmatter(input)).toBe(expected);
		});

		it('should handle frontmatter at the end of content', () => {
			const input = `---
title: Only Frontmatter
---`;
			const expected = ``;
			expect(removeFrontmatter(input)).toBe(expected);
		});
	});

	describe('integration tests', () => {
		it('should work together for typical documentation workflow', () => {
			// Simulate a typical path from tarball to display
			const tarball_path = 'svelte.dev-main/apps/svelte.dev/content/docs/svelte/01-introduction.md';

			// Clean tarball path
			const cleaned_from_tarball = cleanTarballPath(tarball_path);
			expect(cleaned_from_tarball).toBe('apps/svelte.dev/content/docs/svelte/01-introduction.md');

			// This would be stored in DB and later cleaned for display
			const cleaned_for_display = cleanDocumentationPath(cleaned_from_tarball);
			expect(cleaned_for_display).toBe('docs/svelte/01-introduction.md');

			// Extract title for metadata
			const title = extractTitleFromPath(cleaned_from_tarball);
			expect(title).toBe('introduction');
		});

		it('should handle SvelteKit paths through full workflow', () => {
			const tarball_path = 'svelte.dev-main/apps/svelte.dev/content/docs/kit/01-routing.md';

			const cleaned_from_tarball = cleanTarballPath(tarball_path);
			expect(cleaned_from_tarball).toBe('apps/svelte.dev/content/docs/kit/01-routing.md');

			const cleaned_for_display = cleanDocumentationPath(cleaned_from_tarball);
			expect(cleaned_for_display).toBe('docs/kit/01-routing.md');

			const title = extractTitleFromPath(cleaned_from_tarball);
			expect(title).toBe('routing');
		});

		it('should handle tutorial paths through full workflow', () => {
			const tarball_path =
				'svelte.dev-main/apps/svelte.dev/content/tutorial/01-introduction/01-hello-world.md';

			const cleaned_from_tarball = cleanTarballPath(tarball_path);
			expect(cleaned_from_tarball).toBe(
				'apps/svelte.dev/content/tutorial/01-introduction/01-hello-world.md',
			);

			const cleaned_for_display = cleanDocumentationPath(cleaned_from_tarball);
			expect(cleaned_for_display).toBe('tutorial/01-introduction/01-hello-world.md');

			const title = extractTitleFromPath(cleaned_from_tarball);
			expect(title).toBe('hello-world');
		});

		it('should handle content processing with frontmatter removal', () => {
			const content = `---
title: Introduction
---

# Introduction

This is the content.`;

			const content_without_frontmatter = removeFrontmatter(content);
			expect(content_without_frontmatter).toBe(`# Introduction

This is the content.`);
		});
	});
});
