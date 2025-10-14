# Service Workers

Service workers act as proxy servers for network requests, enabling offline support and faster navigation by precaching assets.

## Setup

Create `src/service-worker.js` (or `src/service-worker/index.js`) - it will be bundled and auto-registered.

Default registration (can be [disabled](configuration#serviceWorker)):
```js
if ('serviceWorker' in navigator) {
	addEventListener('load', function () {
		navigator.serviceWorker.register('./path/to/service-worker.js');
	});
}
```

## `$service-worker` Module

Provides:
- `build` - paths to built app files
- `files` - paths to static assets
- `version` - app version string for cache naming
- `base` - deployment base path

## Example: Offline-Capable Service Worker

Caches built app and static files eagerly, caches other requests on-demand:

```js
/// file: src/service-worker.js
// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';

// This gives `self` the correct types
const self = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (globalThis.self));

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});
```

**Gotchas:**
- Be careful caching - stale data may be worse than no data
- Browsers empty caches when full - avoid caching large assets like videos

## Development

Service worker is bundled for production only. In dev, requires browsers supporting [modules in service workers](https://web.dev/es-modules-in-sw).

Manual registration in dev needs module type:
```js
import { dev } from '$app/environment';

navigator.serviceWorker.register('/service-worker.js', {
	type: dev ? 'module' : 'classic'
});
```

**Note:** `build` and `prerendered` are empty arrays during development.

## Alternatives

- [Workbox](https://web.dev/learn/pwa/workbox) - popular PWA library
- [Vite PWA plugin](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html) - Workbox integration for SvelteKit