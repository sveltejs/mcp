# svelte.config.js

Configuration file at project root. Used by SvelteKit and other Svelte tooling.

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## adapter

**Default:** `undefined`

Runs during `vite build`. Determines how output is converted for different platforms.

## alias

**Default:** `{}`

Replace values in `import` statements. Automatically passed to Vite and TypeScript.

```js
/// file: svelte.config.js
const config = {
	kit: {
		alias: {
			'my-file': 'path/to/my-file.js',
			'my-directory': 'path/to/my-directory',
			'my-directory/*': 'path/to/my-directory/*'
		}
	}
};
```

> Built-in `$lib` alias controlled by `config.kit.files.lib`. Run `npm run dev` to generate alias config in `jsconfig.json`/`tsconfig.json`.

## appDir

**Default:** `"_app"`

Directory for SvelteKit assets (JS, CSS) and internal routes.

## csp

Content Security Policy configuration. Protects against XSS attacks.

```js
/// file: svelte.config.js
const config = {
	kit: {
		csp: {
			directives: {
				'script-src': ['self']
			},
			reportOnly: {
				'script-src': ['self'],
				'report-uri': ['/']
			}
		}
	}
};
```

SvelteKit augments directives with nonces/hashes for inline styles/scripts. Use `%sveltekit.nonce%` placeholder in `src/app.html`.

For prerendered pages, CSP added via `<meta http-equiv>` tag (`frame-ancestors`, `report-uri`, `sandbox` ignored).

**mode:** `'hash' | 'nonce' | 'auto'` - `'auto'` uses hashes for prerendered, nonces for dynamic pages.

> Most Svelte transitions create inline `<style>` elements. Leave `style-src` unspecified or add `unsafe-inline`.

## csrf

**Default:** `{ checkOrigin: true, trustedOrigins: [] }`

Protection against cross-site request forgery.

- **checkOrigin** (deprecated, use `trustedOrigins: ['*']`): Verifies `origin` header for POST/PUT/PATCH/DELETE form submissions matches server origin.
- **trustedOrigins:** Array of origins allowed for cross-origin form submissions (e.g., `['https://payment-gateway.com']`). Use `['*']` to trust all (not recommended).

> CSRF checks only apply in production.

## embedded

**Default:** `false`

If `true`, SvelteKit adds event listeners on parent of `%sveltekit.body%` instead of `window`, and uses server `params` instead of inferring from `location.pathname`.

## env

Environment variable configuration.

- **dir** (default: `"."`): Directory to search for `.env` files.
- **publicPrefix** (default: `"PUBLIC_"`): Prefix for client-safe env vars. See `$env/static/public` and `$env/dynamic/public`.
- **privatePrefix** (default: `""`, since v1.21.0): Prefix for server-only env vars. Vars matching neither prefix are discarded. See `$env/static/private` and `$env/dynamic/private`.

## experimental

Experimental features (not subject to semver).

- **tracing.server** (default: `false`, since v2.31.0): Enable OpenTelemetry tracing for `handle` hook, `load` functions, form actions, remote functions.
- **instrumentation.server** (default: `false`, since v2.31.0): Enable `instrumentation.server.js` for tracing/observability.
- **remoteFunctions** (default: `false`): Enable experimental remote functions feature.

## files (deprecated)

- **src** (default: `"src"`, since v2.28): Source code location.
- **assets** (default: `"static"`): Static files with stable URLs.
- **hooks.client** (default: `"src/hooks.client"`): Client hooks location.
- **hooks.server** (default: `"src/hooks.server"`): Server hooks location.
- **hooks.universal** (default: `"src/hooks"`, since v2.3.0): Universal hooks location.
- **lib** (default: `"src/lib"`): Internal library, accessible as `$lib`.
- **params** (default: `"src/params"`): Parameter matchers directory.
- **routes** (default: `"src/routes"`): App structure/routing files.
- **serviceWorker** (default: `"src/service-worker"`): Service worker entry point.
- **appTemplate** (default: `"src/app.html"`): HTML response template.
- **errorTemplate** (default: `"src/error.html"`): Fallback error response template.

## inlineStyleThreshold

**Default:** `0`

Inline CSS in `<style>` block if file length (UTF-16 code units) is below threshold. Reduces initial requests but increases HTML size and reduces browser cache effectiveness.

## moduleExtensions

**Default:** `[".js", ".ts"]`

File extensions SvelteKit treats as modules. Files not matching `config.extensions` or `config.kit.moduleExtensions` are ignored by router.

## outDir

**Default:** `".svelte-kit"`

Directory for SvelteKit build files. Exclude from version control.

## output

### preloadStrategy

**Default:** `"modulepreload"` (since v1.8.4)

Preload strategy for initial page JS modules:
- `'modulepreload'`: Uses `<link rel="modulepreload">`. Best for Chromium, Firefox 115+, Safari 17+.
- `'preload-js'`: Uses `<link rel="preload">`. Prevents waterfalls but Chromium parses modules twice. Modules requested twice in Firefox.
- `'preload-mjs'`: Uses `<link rel="preload">` with `.mjs` extension. Prevents double-parsing in Chromium but some servers may not serve `.mjs` correctly.

### bundleStrategy

**Default:** `'split'` (since v2.13.0)

- `'split'`: Multiple .js/.css files loaded lazily (recommended).
- `'single'`: One .js bundle and one .css file for entire app.
- `'inline'`: Inlines all JS/CSS into HTML (usable without server).

For `'split'`, adjust bundling via Vite's `build.rollupOptions` (`output.experimentalMinChunkSize`, `output.manualChunks`).

For inline assets, set Vite's `build.assetsInlineLimit`:

```js
/// file: vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		assetsInlineLimit: Infinity
	}
});
```

```svelte
/// file: src/routes/+layout.svelte
<script>
	import favicon from './favicon.png';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
```

## paths

- **assets** (default: `""`): Absolute path for serving app files (e.g., storage bucket URL).
- **base** (default: `""`): Root-relative path starting with `/` (e.g., `/base-path`). Prepend to links: `<a href="{base}/your-page">`. Import from `$app/paths`.
- **relative** (default: `true`, since v1.9.0): Use relative asset paths. If `true`, `base` and `assets` from `$app/paths` replaced with relative paths during SSR. If `false`, always root-relative. Set to `false` if using `<base>` element. SPA fallback pages always use absolute paths.

## prerender

- **concurrency** (default: `1`): Max simultaneous prerendered pages.
- **crawl** (default: `true`): Follow links from `entries` to find pages.
- **entries** (default: `["*"]`): Pages to prerender or start crawling from. `*` includes all routes with no required `[parameters]`.
- **handleHttpError** (default: `"fail"`, since v1.15.7): `'fail' | 'ignore' | 'warn' | (details) => void`. Custom handler receives `status`, `path`, `referrer`, `referenceType`, `message`.

```js
/// file: svelte.config.js
const config = {
	kit: {
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (path === '/not-found' && referrer === '/blog/how-we-built-our-404-page') {
					return;
				}
				throw new Error(message);
			}
		}
	}
};
```

- **handleMissingId** (default: `"fail"`, since v1.15.7): `'fail' | 'ignore' | 'warn' | (details) => void`. Handler for hash links without corresponding `id`. Receives `path`, `id`, `referrers`, `message`.
- **handleEntryGeneratorMismatch** (default: `"fail"`, since v1.16.0): `'fail' | 'ignore' | 'warn' | (details) => void`. Handler for entry/route mismatch. Receives `generatedFromId`, `entry`, `matchedId`, `message`.
- **handleUnseenRoutes** (default: `"fail"`, since v2.16.0): `'fail' | 'ignore' | 'warn' | (details) => void`. Handler for prerenderable routes not prerendered. Receives `routes`.
- **origin** (default: `"http://sveltekit-prerender"`): Value of `url.origin` during prerendering.

## router

- **type** (default: `"pathname"`, since v2.14.0): `'pathname' | 'hash'`. `'pathname'` uses URL pathname. `'hash'` uses `location.hash` (disables SSR/prerendering, links must start with `#/`).
- **resolution** (default: `"client"`, since v2.17.0): `'client' | 'server'`. `'client'` uses route manifest in browser. `'server'` determines route on server for each unvisited path (faster initial load, hidden routes, server interception, but slightly slower for unvisited paths).

## version

Client-side navigation version management. Detects new deployments and falls back to full-page navigation on errors.

```html
/// file: +layout.svelte
<script>
	import { beforeNavigate } from '$app/navigation';
	import { updated } from '$app/state';

	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) {
			location.href = to.url.href;
		}
	});
</script>
```

- **name:** App version string (must be deterministic, e.g., commit hash). Defaults to build timestamp.

```js
/// file: svelte.config.js
import * as child_process from 'node:child_process';

export default {
	kit: {
		version: {
			name: child_process.execSync('git rev-parse HEAD').toString().trim()
		}
	}
};
```

- **pollInterval** (default: `0`): Milliseconds to poll for version changes. Sets `updated.current` to `true` when new version detected.

## typescript

- **config** (default: `(config) => config`, since v1.3.0): Function to edit generated `tsconfig.json`. Mutate or return new config. Paths relative to `.svelte-kit/tsconfig.json`.