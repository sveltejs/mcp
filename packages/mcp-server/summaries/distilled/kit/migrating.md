# Migrating from Sapper to SvelteKit

## package.json Changes

### type: "module"
Add `"type": "module"` to `package.json`.

### dependencies
Remove `polka`, `express`, and middleware like `sirv` or `compression`.

### devDependencies
Replace `sapper` with `@sveltejs/kit` and an [adapter](adapters).

### scripts
- `sapper build` → `vite build` (with Node adapter)
- `sapper export` → `vite build` (with static adapter)
- `sapper dev` → `vite dev`
- `node __sapper__/build` → `node build`

## Project Files

### Configuration
Replace `webpack.config.js`/`rollup.config.js` with `svelte.config.js`. Move preprocessor options to `config.preprocess`. Add an [adapter](adapters).

For non-Vite filetypes, add Vite equivalents to [Vite config](project-structure#Project-files-vite.config.js).

### src/client.js
No equivalent. Move custom logic to `+layout.svelte` inside `onMount`.

### src/server.js
Use [custom server](adapter-node#Custom-server) with `adapter-node`, otherwise no equivalent (serverless environments).

### src/service-worker.js
`@sapper/service-worker` → [`$service-worker`]($service-worker):
- `files` unchanged
- `routes` removed
- `shell` → `build`
- `timestamp` → `version`

### src/template.html
Rename to `src/app.html`.

Remove `%sapper.base%`, `%sapper.scripts%`, `%sapper.styles%`.
- `%sapper.head%` → `%sveltekit.head%`
- `%sapper.html%` → `%sveltekit.body%`
- Remove `<div id="sapper">`

### src/node_modules
Use [`src/lib`]($lib) instead (Vite incompatible).

## Pages and Layouts

### Renamed Files
| Old | New |
|-----|-----|
| routes/about/index.svelte | routes/about/+page.svelte |
| routes/about.svelte | routes/about/+page.svelte |
| _error.svelte | +error.svelte |
| _layout.svelte | +layout.svelte |

### Imports
- `@sapper/app`: `goto`, `prefetch`, `prefetchRoutes` → [`$app/navigation`]($app-navigation): `goto`, `preloadData`, `preloadCode`
- `src/node_modules/*` → [`$lib`]($lib)

### Preload
`preload` → [`load`](load) in `+page.js`/`+layout.js`.

**API changes:**
- Single `event` argument (not `page` and `session`)
- No `this` object
- `this.fetch` → `fetch` from input
- `this.error`/`this.redirect` → throw [`error`](load#Errors)/[`redirect`](load#Redirects)

### Stores
```js
// Old
import { stores } from '@sapper/app';
const { preloading, page, session } = stores();
```

**New:** Import directly from [`$app/stores`]($app-stores) (or [`$app/state`]($app-state) for Svelte 5 + SvelteKit 2.12+):
- `preloading` → `navigating` (with `from`/`to` properties)
- `page` now has `url` and `params` (no `path` or `query`)

### Routing
Regex routes removed. Use [advanced route matching](advanced-routing#Matching).

### Segments
`segment` prop removed. Use `$page.url.pathname` instead.

### URLs
Relative URLs now resolve against current page, not base URL. Use root-relative URLs (`/...`) for context-independence.

### &lt;a&gt; Attributes
- `sapper:prefetch` → `data-sveltekit-preload-data`
- `sapper:noscroll` → `data-sveltekit-noscroll`

## Endpoints

No direct `req`/`res` access. Update to new signature for platform-agnostic behavior.

`fetch` now globally available (no need for `node-fetch`).

## Integrations

### HTML Minifier
Not included by default. Add as prod dependency and use via [hook](hooks#Server-hooks-handle):

```js
// @filename: ambient.d.ts
/// <reference types="@sveltejs/kit" />
declare module 'html-minifier';

// @filename: index.js
// ---cut---
import { minify } from 'html-minifier';
import { building } from '$app/environment';

const minification_options = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	conservativeCollapse: true,
	decodeEntities: true,
	html5: true,
	ignoreCustomComments: [/^#/],
	minifyCSS: true,
	minifyJS: false,
	removeAttributeQuotes: true,
	removeComments: false, // some hydration code needs comments, so leave them in
	removeOptionalTags: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	sortAttributes: true,
	sortClassName: true
};

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	let page = '';

	return resolve(event, {
		transformPageChunk: ({ html, done }) => {
			page += html;
			if (done) {
				return building ? minify(page, minification_options) : page;
			}
		}
	});
}
```

**Note:** `prerendering` is `false` with `vite preview`, so inspect built HTML files directly to verify minification.