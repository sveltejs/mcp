# Loading Data

`load` functions fetch data before rendering `+page.svelte` and `+layout.svelte` components.

## Page data

`+page.js` exports a `load` function whose return value is available via the `data` prop:

```js
/// file: src/routes/blog/[slug]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return {
		post: {
			title: `Title for ${params.slug} goes here`,
			content: `Content for ${params.slug} goes here`
		}
	};
}
```

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>
```

`+page.js` runs on both server and browser (unless `export const ssr = false`). For server-only `load` (private env vars, database access), use `+page.server.js`:

```js
/// file: src/routes/blog/[slug]/+page.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		post: await db.getPost(params.slug)
	};
}
```

## Layout data

`+layout.js` or `+layout.server.js` load data for layouts:

```js
/// file: src/routes/blog/[slug]/+layout.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return {
		posts: await db.getPostSummaries()
	};
}
```

```svelte
<!--- file: src/routes/blog/[slug]/+layout.svelte --->
<script>
	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();
</script>

<main>
	{@render children()}
</main>

<aside>
	<h2>More posts</h2>
	<ul>
		{#each data.posts as post}
			<li>
				<a href="/blog/{post.slug}">
					{post.title}
				</a>
			</li>
		{/each}
	</ul>
</aside>
```

Child components access parent layout data. If multiple `load` functions return the same key, the last one wins.

## page.data

Parent layouts can access page/child data via `page.data`:

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.data.title}</title>
</svelte:head>
```

## Universal vs server

**Server `load`** (`+page.server.js`, `+layout.server.js`):
- Always runs server-side
- Access to `cookies`, `locals`, `platform`, `request`, `clientAddress`
- Must return serializable data (devalue format)

**Universal `load`** (`+page.js`, `+layout.js`):
- Runs on server during SSR, then in browser during hydration
- Subsequent runs happen in browser
- Can return any values (custom classes, components)
- Has `data` property containing server `load` return value

**When to use:**
- Server: database access, private env vars
- Universal: external API calls without credentials, non-serializable returns
- Both: pass server data to universal `load` via `data` property

## Using URL data

### url
`URL` instance with `origin`, `hostname`, `pathname`, `searchParams`. `url.hash` unavailable during `load`.

### route
Current route directory relative to `src/routes`:

```js
/// file: src/routes/a/[b]/[...c]/+page.js
/** @type {import('./$types').PageLoad} */
export function load({ route }) {
	console.log(route.id); // '/a/[b]/[...c]'
}
```

### params
Derived from `url.pathname` and `route.id`. For `/a/[b]/[...c]` and pathname `/a/x/y/z`:

```json
{
	"b": "x",
	"c": "y/z"
}
```

## Making fetch requests

Use provided `fetch` function with enhanced features:
- Inherits `cookie` and `authorization` headers on server
- Allows relative requests on server
- Internal requests go directly to handler (no HTTP overhead)
- Response captured and inlined during SSR
- Response read from HTML during hydration (no extra network request)

```js
/// file: src/routes/items/[id]/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
	const res = await fetch(`/api/items/${params.id}`);
	const item = await res.json();

	return { item };
}
```

Cookies passed through `fetch` only if target host is same as app or more specific subdomain.

## Cookies

Server `load` functions can get/set cookies:

```js
/// file: src/routes/+layout.server.js
import * as db from '$lib/server/database';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const sessionid = cookies.get('sessionid');

	return {
		user: await db.getUser(sessionid)
	};
}
```

## Headers

`setHeaders` sets response headers (server-side only):

```js
/// file: src/routes/products/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, setHeaders }) {
	const url = `https://cms.example.com/products.json`;
	const response = await fetch(url);

	setHeaders({
		age: response.headers.get('age'),
		'cache-control': response.headers.get('cache-control')
	});

	return response.json();
}
```

Can only set each header once. Use `cookies.set()` for `set-cookie`.

## Using parent data

Access parent `load` data with `await parent()`:

```js
/// file: src/routes/+layout.js
/** @type {import('./$types').LayoutLoad} */
export function load() {
	return { a: 1 };
}
```

```js
/// file: src/routes/abc/+layout.js
/** @type {import('./$types').LayoutLoad} */
export async function load({ parent }) {
	const { a } = await parent();
	return { b: a + 1 };
}
```

```js
/// file: src/routes/abc/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
	const { a, b } = await parent();
	return { c: a + b };
}
```

**Avoid waterfalls:** Call independent operations before `await parent()`.

## Errors

Throw expected errors with `error` helper:

```js
/// file: src/routes/admin/+layout.server.js
import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		error(401, 'not logged in');
	}

	if (!locals.user.isAdmin) {
		error(403, 'not an admin');
	}
}
```

Unexpected errors treated as 500 and invoke `handleError`.

## Redirects

Use `redirect` helper with 3xx status code:

```js
/// file: src/routes/user/+layout.server.js
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
	if (!locals.user) {
		redirect(307, '/login');
	}
}
```

Don't use inside `try {...}` blocks. For client-side navigation outside `load`, use `goto` from `$app/navigation`.

## Streaming with promises

Server `load` promises stream to browser as they resolve:

```js
/// file: src/routes/blog/[slug]/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	return {
		comments: loadComments(params.slug), // streams
		post: await loadPost(params.slug) // awaited
	};
}
```

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<div>{@html data.post.content}</div>

{#await data.comments}
	Loading comments...
{:then comments}
	{#each comments as comment}
		<p>{comment.content}</p>
	{/each}
{:catch error}
	<p>error loading comments: {error.message}</p>
{/await}
```

Handle rejections to avoid unhandled promise errors. Attach noop-`catch` or use SvelteKit's `fetch`.

**Limitations:**
- Doesn't work without JavaScript
- Can't `setHeaders` or redirect inside streamed promises
- Not supported on some platforms (AWS Lambda, Firebase)

## Parallel loading

All `load` functions run concurrently. Server `load` results grouped into single response during client navigation.

## Rerunning load functions

SvelteKit tracks dependencies to avoid unnecessary reruns.

**A `load` function reruns when:**
- Referenced `params` property changes
- Referenced `url` property changes (`pathname`, `search`, etc.)
- Calls `url.searchParams.get/getAll/has` and parameter changes
- Calls `await parent()` and parent reruns
- Declared dependency via `fetch` or `depends` and URL invalidated with `invalidate(url)`
- `invalidateAll()` called

```js
/// file: src/routes/random-number/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ fetch, depends }) {
	const response = await fetch('https://api.example.com/random-number');
	depends('app:random');

	return {
		number: await response.json()
	};
}
```

```svelte
<!--- file: src/routes/random-number/+page.svelte --->
<script>
	import { invalidate, invalidateAll } from '$app/navigation';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	function rerunLoadFunction() {
		invalidate('app:random');
		invalidate('https://api.example.com/random-number');
		invalidate(url => url.href.includes('random-number'));
		invalidateAll();
	}
</script>

<p>random number: {data.number}</p>
<button onclick={rerunLoadFunction}>Update random number</button>
```

### Untracking dependencies

Exclude from tracking with `untrack`:

```js
/// file: src/routes/+page.js
/** @type {import('./$types').PageLoad} */
export async function load({ untrack, url }) {
	if (untrack(() => url.pathname === '/')) {
		return { message: 'Welcome!' };
	}
}
```

## Implications for authentication

- Layout `load` doesn't run on every request (e.g., client-side navigation)
- Layout and page `load` run concurrently unless `await parent()` called

**Auth strategies:**
- Use hooks to protect routes before `load` runs
- Put auth guards in `+page.server.js` for route-specific protection
- Avoid auth in `+layout.server.js` unless all children call `await parent()`

## Using `getRequestEvent`

Access request event in shared logic:

```js
/// file: src/lib/server/auth.js
import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

export function requireLogin() {
	const { locals, url } = getRequestEvent();

	if (!locals.user) {
		const redirectTo = url.pathname + url.search;
		const params = new URLSearchParams({ redirectTo });

		redirect(307, `/login?${params}`);
	}

	return locals.user;
}
```

```js
/// file: +page.server.js
import { requireLogin } from '$lib/server/auth';

export function load() {
	const user = requireLogin();

	return {
		message: `hello ${user.name}!`
	};
}
```