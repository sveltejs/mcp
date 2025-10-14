# Page Options

SvelteKit renders components on the server first, sends HTML to client, then hydrates for interactivity. Export options from `+page.js`, `+page.server.js`, `+layout.js`, or `+layout.server.js` to control behavior per page or page groups. Child layouts/pages override parent values.

## prerender

Generate static HTML at build time for routes that don't need dynamic rendering.

```js
/// file: +page.js/+page.server.js/+server.js
export const prerender = true;
```

Or prerender everything except specific pages:

```js
/// file: +page.js/+page.server.js/+server.js
export const prerender = false;
```

Use `'auto'` to prerender but keep in manifest for dynamic SSR:

```js
/// file: +page.js/+page.server.js/+server.js
export const prerender = 'auto';
```

Prerenderer starts at root and follows `<a>` links. Configure entry points via `config.kit.prerender.entries` or [`entries`](#entries) function.

During prerendering, `building` from `$app/environment` is `true`.

### Prerendering server routes

`+server.js` files inherit `prerender` from pages that fetch from them:

```js
/// file: +page.js
export const prerender = true;

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const res = await fetch('/my-server-route.json');
	return await res.json();
}
```

### When not to prerender

**Rule:** Two users hitting a page directly must get identical server content.

- Don't prerender personalized content
- `url.searchParams` forbidden during prerender (use in browser only, e.g., `onMount`)
- Pages with [actions](form-actions) can't be prerendered

### Route conflicts

Avoid directory/file name conflicts. Use file extensions: `foo.json/+server.js` and `foo/bar.json/+server.js` create `foo.json` and `foo/bar.json`. Pages write `foo/index.html`.

### Troubleshooting

Error "routes marked as prerenderable, but were not prerendered" means crawler didn't reach the route. Fix by:

- Ensure links exist from `config.kit.prerender.entries` or [`entries`](#entries)
- Add links from other prerendered pages with SSR enabled
- Change to `export const prerender = 'auto'`

## entries

SvelteKit auto-discovers pages by crawling from entry points (non-dynamic routes). For dynamic routes without discoverable links, export `entries`:

```js
/// file: src/routes/blog/[slug]/+page.server.js
/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return [
		{ slug: 'hello-world' },
		{ slug: 'another-blog-post' }
	];
}

export const prerender = true;
```

`entries` can be `async` for fetching from CMS/database.

## ssr

Disable server-side rendering to render empty shell (client-only):

```js
/// file: +page.js
export const ssr = false;
// If both `ssr` and `csr` are `false`, nothing will be rendered!
```

In root `+layout.js`, this turns app into SPA. Not recommended for most cases.

> **Note:** If page options are static values, SvelteKit evaluates them statically. Otherwise, it imports files on server. Browser-only code must not run on module load—import in `+page.svelte` or `+layout.svelte` instead.

## csr

Disable client-side rendering for pages not requiring JavaScript:

```js
/// file: +page.js
export const csr = false;
// If both `csr` and `ssr` are `false`, nothing will be rendered!
```

**Effects:**
- No JavaScript shipped
- `<script>` tags removed from components
- `<form>` can't be progressively enhanced
- Full-page browser navigation
- HMR disabled

Enable in dev only:

```js
/// file: +page.js
import { dev } from '$app/environment';

export const csr = dev;
```

## trailingSlash

Control URL trailing slash behavior: `'never'` (default), `'always'`, or `'ignore'`.

```js
/// file: src/routes/+layout.js
export const trailingSlash = 'always';
```

Affects prerendering: `'always'` creates `about/index.html`, otherwise `about.html`.

> **Note:** Don't use `'ignore'`—relative paths differ (`./y` from `/x` vs `/x/`), and `/x` vs `/x/` are separate URLs (bad for SEO).

## config

Adapter-specific deployment configuration. Shape depends on adapter. Top-level merge only.

```js
/// file: src/routes/+page.js
/** @type {import('some-adapter').Config} */
export const config = {
	runtime: 'edge'
};
```

**Merge example:**

```js
/// file: src/routes/+layout.js
export const config = {
	runtime: 'edge',
	regions: 'all',
	foo: { bar: true }
}
```

```js
/// file: src/routes/+page.js
export const config = {
	regions: ['us1', 'us2'],
	foo: { baz: true }
}
```

**Result:** `{ runtime: 'edge', regions: ['us1', 'us2'], foo: { baz: true } }`