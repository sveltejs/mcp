# Generated Types

## Auto-generated `$types`

SvelteKit generates `.d.ts` files for each endpoint/page to avoid manually typing `params`:

**Before (manual typing):**
```js
/// file: src/routes/[foo]/[bar]/[baz]/+server.js
/** @type {import('@sveltejs/kit').RequestHandler<{
    foo: string;
    bar: string;
    baz: string
  }>} */
export async function GET({ params }) {
	// ...
}
```

**After (using generated types):**
```js
/// file: src/routes/[foo]/[bar]/[baz]/+server.js
/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	// ...
}
```

```js
/// file: src/routes/[foo]/[bar]/[baz]/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	// ...
}
```

## Helper Types

- `PageData` / `LayoutData`: Return types of load functions
- `ActionData`: Union of all `Actions` return values
- `PageProps`: Defines `data: PageData` and `form: ActionData` (v2.16.0+)
- `LayoutProps`: Defines `data: LayoutData` and `children: Snippet` (v2.16.0+)

```svelte
<!--- file: src/routes/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data, form } = $props();
</script>
```

## Setup

Your `tsconfig.json` must extend the generated config:

```json
{ "extends": "./.svelte-kit/tsconfig.json" }
```

## $lib Aliases

- `$lib`: Alias to `src/lib` (or `config.kit.files.lib`)
- `$lib/server`: Server-only modules, prevented from importing client-side

## app.d.ts

Define ambient types in the `App` namespace:

### `App.Error`
Shape of expected/unexpected errors:
```ts
interface Error {
  message: string;
}
```

### `App.Locals`
Type for `event.locals` (available in hooks, server load functions, `+server.js`):
```ts
interface Locals {}
```

### `App.PageData`
Common shape of `page.data` across all pages. Use optional properties for page-specific data:
```ts
interface PageData {}
```

### `App.PageState`
Shape of `page.state` for `pushState`/`replaceState`:
```ts
interface PageState {}
```

### `App.Platform`
Platform-specific context from adapters:
```ts
interface Platform {}
```