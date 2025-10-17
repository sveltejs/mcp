# SvelteKit FAQ

## Including package.json data

Load JSON with import attributes:

```ts
/// file: svelte.config.js
import pkg from './package.json' with { type: 'json' };
```

## Package inclusion issues

Check packaging compatibility at [publint.dev](https://publint.dev/).

**Key packaging requirements:**
- `exports` takes precedence over `main`/`module` (prevents deep imports)
- ESM files: `.mjs` extension OR `"type": "module"` in package.json (then CJS uses `.cjs`)
- `main` should be defined if no `exports`
- Svelte components: distribute as uncompiled `.svelte` files with ESM JS only
- Preprocess TypeScript/SCSS to vanilla JS/CSS (use [`svelte-package`](./packaging))

ESM versions work best with Vite. CJS dependencies are auto-converted by `vite-plugin-svelte` using `esbuild`.

If issues persist, check [Vite issues](https://github.com/vitejs/vite/issues) or try adjusting [`optimizeDeps`](https://vitejs.dev/config/#dep-optimization-options)/[`ssr`](https://vitejs.dev/config/#ssr-options) config (temporary workaround).

## View transitions API

Use `document.startViewTransition` in `onNavigate`:

```js
import { onNavigate } from '$app/navigation';

onNavigate((navigation) => {
	if (!document.startViewTransition) return;

	return new Promise((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
});
```

## Database setup

- Query databases in [server routes](./routing#server), not `.svelte` files
- Create `db.js` singleton for connection
- Run setup code in `hooks.server.js`
- Use [Svelte CLI](/docs/cli/overview) for automatic setup

## Client-side only code

**Browser check:**
```js
import { browser } from '$app/environment';

if (browser) {
	// client-only code
}
```

**onMount (runs after first render):**
```js
import { onMount } from 'svelte';

onMount(async () => {
	const { method } = await import('some-browser-only-library');
	method('hello world');
});
```

**Static import (tree-shaken on server):**
```js
import { onMount } from 'svelte';
import { method } from 'some-browser-only-library';

onMount(() => {
	method('hello world');
});
```

**Await block:**
```svelte
<script>
	import { browser } from '$app/environment';

	const ComponentConstructor = browser ?
		import('some-browser-only-library').then((module) => module.Component) :
		new Promise(() => {});
</script>

{#await ComponentConstructor}
	<p>Loading...</p>
{:then component}
	<svelte:component this={component} />
{:catch error}
	<p>Something went wrong: {error.message}</p>
{/await}
```

## External API server

**Options:**
1. Use [`event.fetch`](./load#Making-fetch-requests) (requires handling CORS)
2. Set up proxy: production rewrites or Vite's [`server.proxy`](https://vitejs.dev/config/server-options.html#server-proxy)
3. Create API route proxy:

```js
/// file: src/routes/api/[...path]/+server.js
/** @type {import('./$types').RequestHandler} */
export function GET({ params, url }) {
	return fetch(`https://example.com/${params.path + url.search}`);
}
```

See [`handleFetch`](./hooks#Server-hooks-handleFetch) for fetch customization.

## Middleware

**Production:** `adapter-node` builds middleware for custom servers

**Dev:** Use Vite plugin:

```js
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').Plugin} */
const myPlugin = {
	name: 'log-request-middleware',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			console.log(`Got request ${req.url}`);
			next();
		});
	}
};

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [myPlugin, sveltekit()]
};

export default config;
```

See [Vite's `configureServer` docs](https://vitejs.dev/guide/api-plugin.html#configureserver).

## Yarn compatibility

**Yarn 2:** PnP is broken with ESM. Use `nodeLinker: 'node-modules'` in `.yarnrc.yml` or switch to npm/pnpm.

**Yarn 3:** ESM support is experimental. Setup:

```sh
yarn create svelte myapp
cd myapp
yarn set version berry
yarn install
```

Add to `.yarnrc.yml`:
```yaml
nodeLinker: node-modules
```

(Avoids build failures with `enableGlobalCache`)