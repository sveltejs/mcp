# adapter-cloudflare-workers

> **DEPRECATED**: Use [`adapter-cloudflare`](adapter-cloudflare) instead. Cloudflare Workers Sites is being deprecated in favor of Workers with Static Assets.

Deploys to [Cloudflare Workers](https://workers.cloudflare.com/) with [Workers Sites](https://developers.cloudflare.com/workers/configuration/sites/).

## Installation

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare-workers';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// see options below
		})
	}
};

export default config;
```

## Options

- **`config`**: Path to Wrangler config file (if not using default `wrangler.jsonc`, `wrangler.json`, or `wrangler.toml`)
- **`platformProxy`**: Preferences for emulated `platform.env` local bindings. See [getPlatformProxy docs](https://developers.cloudflare.com/workers/wrangler/api/#parameters-1)

## Configuration

Create Wrangler config in project root:

```jsonc
/// file: wrangler.jsonc
{
	"name": "<your-service-name>",
	"account_id": "<your-account-id>",
	"main": "./.cloudflare/worker.js",
	"site": {
		"bucket": "./.cloudflare/public"
	},
	"build": {
		"command": "npm run build"
	},
	"compatibility_date": "2021-11-12"
}
```

Get `<your-account-id>` from `wrangler whoami` or Cloudflare dashboard URL.

Add `.cloudflare` and `.wrangler` to `.gitignore`.

## Deploy

```sh
npm i -D wrangler
wrangler login
wrangler deploy
```

## Runtime APIs

Access Cloudflare bindings (KV, DO, etc.) via `platform` in hooks and endpoints:

```js
/// file: +server.js
/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	const x = platform?.env.YOUR_DURABLE_OBJECT_NAMESPACE.idFromName('x');
}
```

**Type definitions:**

```ts
/// file: src/app.d.ts
import { KVNamespace, DurableObjectNamespace } from '@cloudflare/workers-types';

declare global {
	namespace App {
		interface Platform {
			env?: {
				YOUR_KV_NAMESPACE: KVNamespace;
				YOUR_DURABLE_OBJECT_NAMESPACE: DurableObjectNamespace;
			};
		}
	}
}

export {};
```

Use SvelteKit's `$env` module for environment variables.

## Local Testing

`platform` values are emulated in dev/preview using Wrangler config bindings. Configure via `platformProxy` option.

For testing builds, use Wrangler v4: `wrangler dev`

## Troubleshooting

**Node.js compatibility**: Add to Wrangler config:
```jsonc
/// file: wrangler.jsonc
{
	"compatibility_flags": ["nodejs_compat"]
}
```

**Worker size limits**: If bundle exceeds [size limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size), import large libraries client-side only.

**File system**: `fs` unavailable — [prerender](page-options#prerender) routes that need it.