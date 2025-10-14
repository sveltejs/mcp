# Server-only modules

SvelteKit prevents accidental import of sensitive server code into client-side bundles.

## Private environment variables

`$env/static/private` and `$env/dynamic/private` can only be imported in server modules like `hooks.server.js` or `+page.server.js`.

## Server-only utilities

`$app/server` module (contains `read()` for filesystem access) only works on server.

## Making your modules server-only

Two ways:
1. Add `.server` to filename: `secrets.server.js`
2. Place in `$lib/server`: `$lib/server/secrets.js`

## How it works

SvelteKit errors if client code imports server-only modules (directly or indirectly):

```js
/// file: $lib/server/secrets.js
export const atlantisCoordinates = [/* redacted */];
```

```js
/// file: src/routes/utils.js
export { atlantisCoordinates } from '$lib/server/secrets.js';
export const add = (a, b) => a + b;
```

```html
/// file: src/routes/+page.svelte
<script>
	import { add } from './utils.js';
</script>
```

**Error:**
```
Cannot import $lib/server/secrets.ts into code that runs in the browser

 src/routes/+page.svelte imports
  src/routes/utils.js imports
   $lib/server/secrets.ts
```

Even though `+page.svelte` only uses `add`, the entire import chain is blocked to prevent leaking `atlantisCoordinates`.

**Works with dynamic imports**, including interpolated ones like `` await import(`./${foo}.js`) ``.

> **Note:** Detection disabled when `process.env.TEST === 'true'` (for Vitest, etc.)