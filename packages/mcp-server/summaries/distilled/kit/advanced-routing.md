# Advanced Routing

## Rest Parameters

Use `[...param]` for unknown number of segments:

```sh
/[org]/[repo]/tree/[branch]/[...file]
```

Request `/sveltejs/kit/tree/main/documentation/docs/04-advanced-routing.md` produces:

```js
// @noErrors
{
	org: 'sveltejs',
	repo: 'kit',
	branch: 'main',
	file: 'documentation/docs/04-advanced-routing.md'
}
```

**Note:** `src/routes/a/[...rest]/z/+page.svelte` matches `/a/z` (no parameter), `/a/b/z`, `/a/b/c/z`, etc. Validate rest parameters using matchers.

### 404 Pages

Create catch-all route for custom 404s:

```tree
src/routes/
├ marx-brothers/
│ ├ [...path]/
│ ├ chico/
│ ├ harpo/
│ ├ groucho/
│ └ +error.svelte
└ +error.svelte
```

```js
/// file: src/routes/marx-brothers/[...path]/+page.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load(event) {
	error(404, 'Not Found');
}
```

**Note:** Unhandled 404s appear in `handleError`.

## Optional Parameters

Wrap parameter in double brackets: `[[lang]]/home` matches both `/home` and `/en/home`.

**Note:** Optional parameters cannot follow rest parameters (`[...rest]/[[optional]]`).

## Matching

Validate parameters with matchers in `src/params/`:

```js
/// file: src/params/fruit.js
/**
 * @param {string} param
 * @return {param is ('apple' | 'orange')}
 * @satisfies {import('@sveltejs/kit').ParamMatcher}
 */
export function match(param) {
	return param === 'apple' || param === 'orange';
}
```

Use in routes: `src/routes/fruits/[page=fruit]`

**Note:** Matchers run on server and browser. `*.test.js` and `*.spec.js` files are ignored.

## Sorting

Multiple routes can match same path. Priority rules:

1. More specific routes rank higher
2. Parameters with matchers (`[name=type]`) beat those without (`[name]`)
3. `[[optional]]` and `[...rest]` have lowest priority (ignored unless final segment)
4. Ties resolved alphabetically

Example ordering:

```sh
src/routes/foo-abc/+page.svelte
src/routes/foo-[c]/+page.svelte
src/routes/[[a=x]]/+page.svelte
src/routes/[b]/+page.svelte
src/routes/[...catchall]/+page.svelte
```

## Encoding

Use hexadecimal escapes `[x+nn]` for special characters:

- `\` — `[x+5c]`, `/` — `[x+2f]`, `:` — `[x+3a]`, `*` — `[x+2a]`
- `?` — `[x+3f]`, `"` — `[x+22]`, `<` — `[x+3c]`, `>` — `[x+3e]`
- `|` — `[x+7c]`, `#` — `[x+23]`, `%` — `[x+25]`
- `[` — `[x+5b]`, `]` — `[x+5d]`, `(` — `[x+28]`, `)` — `[x+29]`

Example: `/smileys/:-)` → `src/routes/smileys/[x+3a]-[x+29]/+page.svelte`

Unicode escapes: `[u+nnnn]` (e.g., `[u+d83e][u+dd2a]` or `🤪`)

**Tip:** Encode leading `.` for TypeScript compatibility: `[x+2e]well-known`

## Advanced Layouts

### (group)

Parentheses create route groups without affecting URLs:

```tree
src/routes/
│ (app)/
│ ├ dashboard/
│ ├ item/
│ └ +layout.svelte
│ (marketing)/
│ ├ about/
│ ├ testimonials/
│ └ +layout.svelte
├ admin/
└ +layout.svelte
```

`/admin` doesn't inherit `(app)` or `(marketing)` layouts.

### +page@

Break out of layouts with `@segment`:

```tree
src/routes/
├ (app)/
│ ├ item/
│ │ ├ [id]/
│ │ │ ├ embed/
│ │ │ │ └ +page@(app).svelte
│ │ │ └ +layout.svelte
│ │ └ +layout.svelte
│ └ +layout.svelte
└ +layout.svelte
```

Options:
- `+page@[id].svelte` — inherits from `[id]/+layout.svelte`
- `+page@item.svelte` — inherits from `item/+layout.svelte`
- `+page@(app).svelte` — inherits from `(app)/+layout.svelte`
- `+page@.svelte` — inherits from root layout

### +layout@

Layouts can also break out:

```
src/routes/
├ (app)/
│ ├ item/
│ │ ├ [id]/
│ │ │ ├ embed/
│ │ │ │ └ +page.svelte  // uses (app)/item/[id]/+layout.svelte
│ │ │ ├ +layout.svelte  // inherits from (app)/item/+layout@.svelte
│ │ │ └ +page.svelte    // uses (app)/item/+layout@.svelte
│ │ └ +layout@.svelte   // inherits from root layout, skipping (app)/+layout.svelte
│ └ +layout.svelte
└ +layout.svelte
```

### When to Use Groups

Groups aren't always necessary. Alternative: reuse components/functions:

```svelte
<!--- file: src/routes/nested/route/+layout@.svelte --->
<script>
	import ReusableLayout from '$lib/ReusableLayout.svelte';
	let { data, children } = $props();
</script>

<ReusableLayout {data}>
	{@render children()}
</ReusableLayout>
```

```js
/// file: src/routes/nested/route/+layout.js
// @filename: ambient.d.ts
declare module "$lib/reusable-load-function" {
	export function reusableLoad(event: import('@sveltejs/kit').LoadEvent): Promise<Record<string, any>>;
}
// @filename: index.js
// ---cut---
import { reusableLoad } from '$lib/reusable-load-function';

/** @type {import('./$types').PageLoad} */
export function load(event) {
	// Add additional logic here, if needed
	return reusableLoad(event);
}
```