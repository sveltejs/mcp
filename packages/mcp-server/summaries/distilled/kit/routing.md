# Routing

SvelteKit uses **filesystem-based routing**. Routes are defined by directories in your codebase:

- `src/routes` → root route
- `src/routes/about` → `/about` route  
- `src/routes/blog/[slug]` → route with parameter `slug`

## Key Rules

- All files run on server
- All files run on client except `+server` files
- `+layout` and `+error` files apply to subdirectories

## +page

### +page.svelte

Defines a page. Rendered on server (SSR) initially, then client (CSR) for navigation.

```svelte
<!--- file: src/routes/+page.svelte --->
<h1>Hello and welcome to my site!</h1>
<a href="/about">About my site</a>
```

Use `<a>` elements for navigation, not framework-specific components.

Receive data from `load` via `data` prop:

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.title}</h1>
<div>{@html data.content}</div>
```

### +page.js

Export `load` function to fetch data. Runs on server (SSR) and client (navigation).

```js
/// file: src/routes/blog/[slug]/+page.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	if (params.slug === 'hello-world') {
		return {
			title: 'Hello world!',
			content: 'Welcome to our blog. Lorem ipsum dolor sit amet...'
		};
	}

	error(404, 'Not found');
}
```

Can export page options: `prerender`, `ssr`, `csr`

### +page.server.js

Server-only `load` function. Use for database access or private env variables. Return value must be serializable.

```js
/// file: src/routes/blog/[slug]/+page.server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const post = await getPostFromDatabase(params.slug);

	if (post) {
		return post;
	}

	error(404, 'Not found');
}
```

Can also export **actions** for writing data via `<form>` elements.

## +error

Customize error pages per route:

```svelte
<!--- file: src/routes/blog/[slug]/+error.svelte --->
<script>
	import { page } from '$app/state';
</script>

<h1>{page.status}: {page.error.message}</h1>
```

SvelteKit walks up tree to find closest error boundary. If all fail, renders `src/error.html`.

**Note:** `+error.svelte` not used for errors in `handle` hook or `+server.js` handlers.

## +layout

### +layout.svelte

Shared UI across pages. Must include `{@render children()}` for page content.

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/settings">Settings</a>
</nav>

{@render children()}
```

Layouts can be nested. Each inherits parent layout by default.

### +layout.js

Load data for layouts:

```js
/// file: src/routes/settings/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		sections: [
			{ slug: 'profile', title: 'Profile' },
			{ slug: 'notifications', title: 'Notifications' }
		]
	};
}
```

Layout data available to all child pages:

```svelte
<!--- file: src/routes/settings/profile/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	console.log(data.sections); // [{ slug: 'profile', title: 'Profile' }, ...]
</script>
```

Can export page options as defaults for children.

### +layout.server.js

Server-only layout `load`. Change type to `LayoutServerLoad`.

## +server

API routes. Export HTTP verb functions (`GET`, `POST`, etc.) that return `Response` objects.

```js
/// file: src/routes/api/random-number/+server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const min = Number(url.searchParams.get('min') ?? '0');
	const max = Number(url.searchParams.get('max') ?? '1');

	const d = max - min;

	if (isNaN(d) || d < 0) {
		error(400, 'min and max must be numbers, and min must be less than max');
	}

	const random = min + Math.random() * d;

	return new Response(String(random));
}
```

### Receiving data

```js
/// file: src/routes/api/add/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { a, b } = await request.json();
	return json(a + b);
}
```

**Note:** Form actions are generally better for browser-to-server data submission.

### Fallback handler

Handles unhandled HTTP methods:

```js
/// file: src/routes/api/add/+server.js
/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
	return text(`I caught your ${request.method} request!`);
}
```

### Content negotiation

`+server.js` can coexist with `+page` files:
- `PUT`/`PATCH`/`DELETE`/`OPTIONS` → always `+server.js`
- `GET`/`POST`/`HEAD` → page if `accept` header prioritizes `text/html`, else `+server.js`

## $types

SvelteKit generates `$types.d.ts` for type safety:

```svelte
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>
```

Types: `PageProps`, `LayoutProps`, `PageLoad`, `PageServerLoad`, `LayoutLoad`, `LayoutServerLoad`, `RequestHandler`

With proper IDE tooling, types can be omitted entirely—they're auto-inserted.

## Other files

Non-route files in route directories are ignored. Colocate components with routes or use `$lib` for shared modules.