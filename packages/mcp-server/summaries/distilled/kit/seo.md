# SEO

## Out of the box

### SSR
Search engines index server-side rendered content more reliably. SvelteKit uses SSR by default—keep it enabled unless necessary to disable in [`handle`](hooks#Server-hooks-handle).

### Performance
[Core Web Vitals](https://web.dev/vitals/#core-web-vitals) impact search ranking. Use [hybrid rendering](glossary#Hybrid-app), [optimize images](images), and test with [PageSpeed Insights](https://pagespeed.web.dev/) or [Lighthouse](https://developers.google.com/web/tools/lighthouse). See [performance page](performance) for details.

### Normalized URLs
SvelteKit redirects trailing slashes based on [`trailingSlash`](page-options#trailingSlash) config to avoid duplicate URLs.

## Manual setup

### &lt;title&gt; and &lt;meta&gt;
Every page needs unique `<title>` and `<meta name="description">` in [`<svelte:head>`](../svelte/svelte-head). See [Lighthouse SEO audits](https://web.dev/lighthouse-seo/).

**Pattern:** Return SEO data from page [`load`](load) functions, use as [`page.data`]($app-state) in `<svelte:head>` in root [layout](routing#layout).

### Sitemaps
Create dynamic sitemaps with endpoints:

```js
/// file: src/routes/sitemap.xml/+server.js
export async function GET() {
	return new Response(
		`
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			<!-- <url> elements go here -->
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml'
			}
		}
	);
}
```

### AMP
For [AMP](https://amp.dev/) sites:

1. Set [`inlineStyleThreshold`](configuration#inlineStyleThreshold) to `Infinity`
2. Disable `csr` in root layout
3. Add `amp` to `app.html`
4. Transform HTML with `@sveltejs/amp` in `transformPageChunk`

```js
/// file: src/hooks.server.js
import * as amp from '@sveltejs/amp';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	let buffer = '';
	return await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			buffer += html;
			if (done) return amp.transform(buffer);
		}
	});
}
```

**Optional:** Remove unused CSS with [`dropcss`](https://www.npmjs.com/package/dropcss):

```js
/// file: src/hooks.server.js
// @errors: 2307
import * as amp from '@sveltejs/amp';
import dropcss from 'dropcss';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	let buffer = '';

	return await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			buffer += html;

			if (done) {
				let css = '';
				const markup = amp
					.transform(buffer)
					.replace('⚡', 'amp') // dropcss can't handle this character
					.replace(/<style amp-custom([^>]*?)>([^]+?)<\/style>/, (match, attributes, contents) => {
						css = contents;
						return `<style amp-custom${attributes}></style>`;
					});

				css = dropcss({ css, html: markup }).css;
				return markup.replace('</style>', `${css}</style>`);
			}
		}
	});
}
```

> Validate transformed HTML with `amphtml-validator` in `handle` hook, but only when prerendering (it's slow).