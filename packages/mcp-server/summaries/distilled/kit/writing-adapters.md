# Building Adapters

## Adapter API

Adapters implement this structure:

```js
// @errors: 2322
// @filename: ambient.d.ts
type AdapterSpecificOptions = any;

// @filename: index.js
// ---cut---
/** @param {AdapterSpecificOptions} options */
export default function (options) {
	/** @type {import('@sveltejs/kit').Adapter} */
	const adapter = {
		name: 'adapter-package-name',
		async adapt(builder) {
			// adapter implementation
		},
		async emulate() {
			return {
				async platform({ config, prerender }) {
					// the returned object becomes `event.platform` during dev, build and
					// preview. Its shape is that of `App.Platform`
				}
			}
		},
		supports: {
			read: ({ config, route }) => {
				// Return `true` if the route with the given `config` can use `read`
				// from `$app/server` in production, return `false` if it can't.
				// Or throw a descriptive error describing how to configure the deployment
			},
			tracing: () => {
				// Return `true` if this adapter supports loading `tracing.server.js`.
				// Return `false if it can't, or throw a descriptive error.
			}
		}
	};

	return adapter;
}
```

**Required:** `name`, `adapt`  
**Optional:** `emulate`, `supports`

## `adapt` Method Tasks

1. Clear build directory
2. Write output: `builder.writeClient`, `builder.writeServer`, `builder.writePrerendered`
3. Output code that:
   - Imports `Server` from `${builder.getServerDirectory()}/index.js`
   - Instantiates app with `builder.generateManifest({ relativePath })`
   - Converts platform requests to standard `Request`
   - Calls `server.respond(request, { getClientAddress })` to generate `Response`
   - Exposes platform info via `platform` option in `server.respond`
   - Shims `fetch` if needed (use `@sveltejs/kit/node/polyfills` for undici-compatible platforms)
4. Bundle output to avoid dependencies on target platform
5. Place static files and JS/CSS in correct locations

**Recommended structure:** Output under `build/`, intermediate files under `.svelte-kit/[adapter-name]`

**Tip:** Copy an existing [adapter source](https://github.com/sveltejs/kit/tree/main/packages) as starting point.