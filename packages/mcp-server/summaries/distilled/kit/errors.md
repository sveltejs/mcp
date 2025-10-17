# Errors

## Error Objects

SvelteKit distinguishes between **expected** and **unexpected** errors. Both are `{ message: string }` objects by default.

## Expected Errors

Created with `error()` helper from `@sveltejs/kit`:

```js
/// file: src/routes/blog/[slug]/+page.server.js
import { error } from '@sveltejs/kit';
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const post = await db.getPost(params.slug);

	if (!post) {
		error(404, {
			message: 'Not found'
		});
	}

	return { post };
}
```

Sets response status and renders nearest `+error.svelte` component where `page.error` is the error object.

```svelte
<!--- file: src/routes/+error.svelte --->
<script>
	import { page } from '$app/state';
</script>

<h1>{page.error.message}</h1>
```

Add extra properties:

```js
error(404, {
	message: 'Not found',
	code: 'NOT_FOUND'
});
```

Or use string shorthand:

```js
error(404, 'Not found');
```

## Unexpected Errors

Any other exception during request handling. Not exposed to users (default: `{ "message": "Internal Error" }`).

Logged to console/server logs and passed through `handleError` hook for custom handling.

## Responses

**In `handle` or `+server.js`:** Returns fallback error page or JSON based on `Accept` headers.

**In `load` functions:** Renders nearest `+error.svelte` component. If error occurs in `+layout(.server).js`, uses `+error.svelte` _above_ that layout.

**Root layout errors:** Use fallback error page since root layout contains `+error.svelte`.

### Custom Fallback Error Page

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>%sveltekit.error.message%</title>
	</head>
	<body>
		<h1>My custom error page</h1>
		<p>Status: %sveltekit.status%</p>
		<p>Message: %sveltekit.error.message%</p>
	</body>
</html>
```

## Type Safety

Customize error shape via `App.Error` interface:

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface Error {
			code: string;
			id: string;
		}
	}
}

export {};
```

Always includes `message: string` property.