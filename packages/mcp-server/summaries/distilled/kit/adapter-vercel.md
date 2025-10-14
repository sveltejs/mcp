# Vercel Adapter

Deploy to Vercel using [`adapter-vercel`](https://github.com/sveltejs/kit/tree/main/packages/adapter-vercel). Auto-installed with `adapter-auto`.

## Setup

```bash
npm i -D @sveltejs/adapter-vercel
```

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// options here
		})
	}
};

export default config;
```

## Deployment Configuration

Configure via adapter options or `export const config` in `+server.js`, `+page(.server).js`, `+layout(.server).js`.

```js
/// file: about/+page.js
/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	split: true
};
```

### All Functions
- `runtime`: `'edge'`, `'nodejs18.x'`, `'nodejs20.x'`, `'nodejs22.x'` (deprecated, use Vercel dashboard config)
- `regions`: array of [edge regions](https://vercel.com/docs/concepts/edge-network/regions) or `'all'` for edge (default `["iad1"]` for serverless)
- `split`: deploy route as individual function

### Edge Functions Only
- `external`: dependencies to exclude from esbuild bundling

### Serverless Functions Only
- `memory`: 128-3008 Mb (default 1024)
- `maxDuration`: seconds (10 Hobby, 15 Pro, 900 Enterprise)
- `isr`: Incremental Static Regeneration config

Config in layouts applies to child routes unless overridden.

## Image Optimization

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			images: {
				sizes: [640, 828, 1200, 1920, 3840],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300,
				domains: ['example-app.vercel.app'],
			}
		})
	}
};

export default config;
```

## Incremental Static Regeneration (ISR)

[ISR](https://vercel.com/docs/incremental-static-regeneration) provides prerendered performance with dynamic flexibility.

**⚠️ Use only for content identical across all visitors. No user-specific data (sessions, cookies) or it will leak.**

```js
import { BYPASS_TOKEN } from '$env/static/private';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	isr: {
		expiration: 60,
		bypassToken: BYPASS_TOKEN,
		allowQuery: ['search']
	}
};
```

**Note:** ISR ignored on routes with `export const prerender = true`.

### Options
- `expiration` (required): seconds before re-generation (`false` = never)
- `bypassToken`: 32+ char token for cache bypass via `__prerender_bypass=<token>` cookie or `x-prerender-revalidate: <token>` header
- `allowQuery`: query params contributing to cache key (others ignored)

Generate token: `crypto.randomUUID()`. Set as `BYPASS_TOKEN` env var in Vercel. Pull locally: `vercel env pull .env.development.local`

## Environment Variables

Access [Vercel system env vars](https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables) from `$env/static/private` or `$env/dynamic/private`.

```js
/// file: +layout.server.js
import { VERCEL_COMMIT_REF } from '$env/static/private';

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
	return {
		deploymentGitBranch: VERCEL_COMMIT_REF
	};
}
```

```svelte
<!--- file: +layout.svelte --->
<script>
	/** @type {import('./$types').LayoutProps} */
	let { data } = $props();
</script>

<p>This staging environment was deployed from {data.deploymentGitBranch}.</p>
```

**Prefer `$env/static/private`** for static replacement and dead code elimination.

## Skew Protection

[Skew protection](https://vercel.com/docs/deployments/skew-protection) routes users to their original deployment via cookie. Enable in Vercel project settings > Advanced.

**Caveat:** Multiple tabs with different versions will route to newest, falling back to SvelteKit's built-in protection.

## Notes

### Vercel Functions
`/api/*` requests bypass SvelteKit if `api` directory exists at project root. Use [API routes](routing#server) instead.

### Node Version
Update in [project settings](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js#node.js-version) if using old default.

## Troubleshooting

### File System Access
- **Edge functions:** `fs` unavailable
- **Serverless functions:** `fs` won't work as expected. Use [`read()`]($app-server#read) from `$app/server` instead
- Alternative: [prerender](page-options#prerender) routes

### Deployment Protection
If using [`read()`]($app-server#read) in edge functions with [Deployment Protection](https://vercel.com/docs/deployment-protection), enable [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation) to avoid 401 errors.