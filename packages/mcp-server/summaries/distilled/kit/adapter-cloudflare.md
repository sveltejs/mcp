# Cloudflare Adapter

Deploy to Cloudflare Workers or Cloudflare Pages using `adapter-cloudflare`.

## Comparisons

- `adapter-cloudflare` – all SvelteKit features; builds for Workers Static Assets and Pages
- `adapter-cloudflare-workers` – deprecated
- `adapter-static` – client-side only; compatible with Workers Static Assets and Pages

## Usage

```bash
npm i -D @sveltejs/adapter-cloudflare
```

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			config: undefined,
			platformProxy: {
				configPath: undefined,
				environment: undefined,
				persist: undefined
			},
			fallback: 'plaintext',
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			}
		})
	}
};

export default config;
```

## Options

### config
Path to Wrangler config file (if not using default `wrangler.jsonc`, `wrangler.json`, or `wrangler.toml`).

### platformProxy
Preferences for emulated `platform.env` local bindings. See [getPlatformProxy docs](https://developers.cloudflare.com/workers/wrangler/api/#parameters-1).

### fallback
Render `plaintext` or `spa` 404 page for non-matching assets. Default `plaintext` is usually sufficient. Use `spa` if using `routes.exclude` to avoid unstyled 404s.

### routes
**Cloudflare Pages only.** Customizes `_routes.json`:
- `include` – routes that invoke a function (default `['/*']`)
- `exclude` – routes that don't invoke a function (faster/cheaper for static assets)
  - `<build>` – Vite build artifacts
  - `<files>` – `static` directory contents
  - `<prerendered>` – prerendered pages
  - `<all>` – all above (default)

Max 100 combined rules. Useful if `<prerendered>` exceeds limit (e.g., use `'/articles/*'` instead of individual paths).

## Cloudflare Workers

### Basic Configuration

```jsonc
/// file: wrangler.jsonc
{
	"name": "<any-name-you-want>",
	"main": ".svelte-kit/cloudflare/_worker.js",
	"compatibility_date": "2025-01-01",
	"assets": {
		"binding": "ASSETS",
		"directory": ".svelte-kit/cloudflare",
	}
}
```

### Deployment
Follow [Cloudflare Workers framework guide](https://developers.cloudflare.com/workers/frameworks/framework-guides/svelte/).

## Cloudflare Pages

### Deployment
Follow [Get Started Guide](https://developers.cloudflare.com/pages/get-started/).

**Git integration build settings:**
- Framework preset: SvelteKit
- Build command: `npm run build` or `vite build`
- Build output directory: `.svelte-kit/cloudflare`

### Notes
Functions in `/functions` directory are ignored. Use SvelteKit [server endpoints](routing#server) instead (compiled to single `_worker.js`).

## Runtime APIs

Access `env` (bindings), `ctx`, `caches`, and `cf` via `platform` in hooks and endpoints:

```js
// @filename: ambient.d.ts
import { DurableObjectNamespace } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env: {
				YOUR_DURABLE_OBJECT_NAMESPACE: DurableObjectNamespace;
			};
		}
	}
}
// @filename: +server.js
// ---cut---
// @errors: 2355 2322
/// file: +server.js
/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	const x = platform?.env.YOUR_DURABLE_OBJECT_NAMESPACE.idFromName('x');
}
```

> [!NOTE] Use SvelteKit's `$env` module for environment variables.

**Type definitions:**

```ts
/// file: src/app.d.ts
+++import { KVNamespace, DurableObjectNamespace } from '@cloudflare/workers-types';+++

declare global {
	namespace App {
		interface Platform {
+++			env: {
				YOUR_KV_NAMESPACE: KVNamespace;
				YOUR_DURABLE_OBJECT_NAMESPACE: DurableObjectNamespace;
			};+++
		}
	}
}

export {};
```

### Testing Locally

`platform` values are emulated in dev/preview using Wrangler config bindings. Use `platformProxy` option to customize.

For build testing, use Wrangler 4:
- Workers: `wrangler dev .svelte-kit/cloudflare`
- Pages: `wrangler pages dev .svelte-kit/cloudflare`

## Headers and Redirects

`_headers` and `_redirects` files (in project root) only affect static assets. For dynamic responses, use server endpoints or `handle` hook.

## Troubleshooting

### Node.js Compatibility

```jsonc
/// file: wrangler.jsonc
{
	"compatibility_flags": ["nodejs_compat"]
}
```

### Worker Size Limits

If exceeding [size limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size), import large libraries client-side only. See [FAQ](./faq#How-do-I-use-a-client-side-library-accessing-document-or-window).

### Accessing File System

Can't use `fs`. Use [`read`]($app-server#read) from `$app/server` (fetches from deployed assets) or [prerender](page-options#prerender) routes.

## Migrating from Workers Sites

Replace `adapter-cloudflare-workers` with `adapter-cloudflare`. Update config:

```js
// @errors: 2307
/// file: svelte.config.js
---import adapter from '@sveltejs/adapter-cloudflare-workers';---
+++import adapter from '@sveltejs/adapter-cloudflare';+++

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

```jsonc
/// file: wrangler.jsonc
{
---	"site": {
		"bucket": ".cloudflare/public"
	},---
+++	"assets": {
		"directory": ".cloudflare/public",
		"binding": "ASSETS" // Exclude this if you don't have a `main` key configured.
	}+++
}
```