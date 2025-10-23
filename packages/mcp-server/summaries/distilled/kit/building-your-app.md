# Building

Build happens in two stages via `vite build`:
1. Vite creates optimized production build (server, browser, service worker). Prerendering runs here.
2. Adapter tunes build for target environment.

## During build

Code in `+page/layout(.server).js` files executes during build analysis. Prevent execution with `building` check:

```js
import { building } from '$app/environment';
import { setupMyDatabase } from '$lib/server/database';

if (!building) {
	setupMyDatabase();
}

export function load() {
	// ...
}
```

## Preview

`vite preview` runs production build locally in Node. Not perfect reproduction - adapter-specific features like `platform` object don't apply.