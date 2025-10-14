# Adapters

Adapters are plugins that transform your built SvelteKit app for specific deployment targets.

## Official Adapters

- `@sveltejs/adapter-cloudflare` - Cloudflare Workers/Pages
- `@sveltejs/adapter-netlify` - Netlify
- `@sveltejs/adapter-node` - Node servers
- `@sveltejs/adapter-static` - Static site generation (SSG)
- `@sveltejs/adapter-vercel` - Vercel

Community adapters available for other platforms.

## Configuration

Specify adapter in `svelte.config.js`:

```js
/// file: svelte.config.js
// @filename: ambient.d.ts
declare module 'svelte-adapter-foo' {
	const adapter: (opts: any) => import('@sveltejs/kit').Adapter;
	export default adapter;
}

// @filename: index.js
// ---cut---
import adapter from 'svelte-adapter-foo';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// adapter options go here
		})
	}
};

export default config;
```

## Platform-Specific Context

Some adapters provide additional request info via the `platform` property in `RequestEvent` (available in hooks and server routes). Example: Cloudflare Workers expose `env` object with KV namespaces. Check adapter docs for details.