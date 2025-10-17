# SvelteKit v1 to v2 Migration Guide

Use `npx sv migrate sveltekit-2` to auto-migrate many changes.

## `redirect` and `error` no longer thrown

Don't `throw` these anymore — just call them:

```js
import { error } from '@sveltejs/kit'

// Before
throw error(500, 'something went wrong');
// After
error(500, 'something went wrong');
```

Inside `try` blocks, use `isHttpError` and `isRedirect` from `@sveltejs/kit` to distinguish them.

## `path` required for cookies

Must specify `path` when setting/deleting cookies. Usually `path: '/'`:

```js
export function load({ cookies }) {
	cookies.set(name, value, { path: '/' });
	return { response }
}
```

## Top-level promises not auto-awaited

Promises in `load` return values are no longer automatically awaited. Use `await` explicitly:

```js
// Single promise
export async function load({ fetch }) {
	const response = await fetch(url).then(r => r.json());
	return { response }
}
```

```js
// Multiple promises - use Promise.all to avoid waterfalls
export async function load({ fetch }) {
	const [a, b] = await Promise.all([
	  fetch(url1).then(r => r.json()),
	  fetch(url2).then(r => r.json()),
	]);
	return { a, b };
}
```

## `goto()` changes

- No longer accepts external URLs (use `window.location.href = url`)
- `state` object now sets `$page.state` and must match `App.PageState` interface

## Paths relative by default

[`paths.relative`](configuration#paths) defaults to `true`. All paths (including `%sveltekit.assets%`, `base`, `assets`) are consistently relative or absolute based on this setting.

## Server fetches not trackable

`dangerZone.trackServerFetches` removed due to security concerns.

## `preloadCode` requires `base` prefix

Both [`preloadCode`]($app-navigation#preloadCode) and [`preloadData`]($app-navigation#preloadData) now require `base` prefix if set. `preloadCode` takes single argument instead of multiple.

## `resolvePath` → `resolveRoute`

```js
// Before
import { resolvePath } from '@sveltejs/kit';
import { base } from '$app/paths';
const path = base + resolvePath('/blog/[slug]', { slug });

// After
import { resolveRoute } from '$app/paths';
const path = resolveRoute('/blog/[slug]', { slug });
```

## Improved error handling

`handleError` hook now receives `status` and `message` properties. Errors from your code have `status: 500` and `message: "Internal Error"`.

## Dynamic env vars unavailable during prerendering

`$env/dynamic/public` and `$env/dynamic/private` cannot be read during prerendering — use `$env/static/*` instead. Browser gets fresh values from `/_app/env.js`.

## `use:enhance` callback changes

`form` and `data` removed — use `formElement` and `formData` instead.

## File input forms require `multipart/form-data`

Forms with `<input type="file">` must have `enctype="multipart/form-data"` or SvelteKit throws error.

## Stricter `tsconfig.json`

Don't use `paths` or `baseUrl` in `tsconfig.json` — use [`alias` config](configuration#alias) in `svelte.config.js` instead.

## `getRequest` error handling

Errors for oversized `Content-Length` thrown when reading body, not when calling `getRequest`.

## `vitePreprocess` import change

Import from `@sveltejs/vite-plugin-svelte` instead of `@sveltejs/kit/vite`.

## Dependency requirements

- Node `18.13+`
- `svelte@4+`
- `vite@5+`
- `typescript@5+`
- `@sveltejs/vite-plugin-svelte@3+` (now peer dependency)

Generated `tsconfig.json` uses `"moduleResolution": "bundler"` and `verbatimModuleSyntax`.

## SvelteKit 2.12: `$app/stores` deprecated

Replace with `$app/state` (Svelte 5 runes-based). Provides fine-grained reactivity.

```svelte
<script>
	// Before
	import { page } from '$app/stores';
	// After
	import { page } from '$app/state';
</script>

<!-- Before -->
{$page.data}
<!-- After -->
{page.data}
```

Use `npx sv migrate app-state` to auto-migrate.