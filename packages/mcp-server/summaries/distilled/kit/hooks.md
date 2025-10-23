# Hooks

App-wide functions that SvelteKit calls in response to specific events.

Three optional hook files:
- `src/hooks.server.js` — server hooks
- `src/hooks.client.js` — client hooks  
- `src/hooks.js` — universal hooks (run on both)

Code runs at app startup, useful for initializing database clients.

## Server hooks

### handle

Runs on every server request (including prerendering). Receives `event` and `resolve` function.

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname.startsWith('/custom')) {
		return new Response('custom response');
	}

	const response = await resolve(event);
	return response;
}
```

Default: `({ event, resolve }) => resolve(event)`

**locals**: Add custom data to `event.locals` for use in handlers and `load` functions:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.user = await getUserInformation(event.cookies.get('sessionid'));

	const response = await resolve(event);

	response.headers.set('x-custom-header', 'potato');

	return response;
}
```

**resolve options** (second parameter):
- `transformPageChunk({ html, done })` — transform HTML chunks
- `filterSerializedResponseHeaders(name, value)` — filter headers in serialized responses (default: none)
- `preload({ type, path })` — determine which files to preload (default: `js` and `css`)

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('old', 'new'),
		filterSerializedResponseHeaders: (name) => name.startsWith('x-'),
		preload: ({ type, path }) => type === 'js' || path.includes('/important/')
	});

	return response;
}
```

### handleFetch

Modify `event.fetch` calls on server/during prerendering:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ request, fetch }) {
	if (request.url.startsWith('https://api.yourapp.com/')) {
		request = new Request(
			request.url.replace('https://api.yourapp.com/', 'http://localhost:9999/'),
			request
		);
	}

	return fetch(request);
}
```

For sibling subdomains, manually include cookies:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
	if (request.url.startsWith('https://api.my-domain.com/')) {
		request.headers.set('cookie', event.request.headers.get('cookie'));
	}

	return fetch(request);
}
```

### handleValidationError

Called when remote function argument doesn't match schema. Returns `App.Error` shape:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').HandleValidationError} */
export function handleValidationError({ issues }) {
	return {
		message: 'No thank you'
	};
}
```

## Shared hooks

Available in both `src/hooks.server.js` and `src/hooks.client.js`:

### handleError

Called for unexpected errors. Log errors and return safe error representation:

```js
/// file: src/hooks.server.js
import * as Sentry from '@sentry/sveltekit';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

```js
/// file: src/hooks.client.js
import * as Sentry from '@sentry/sveltekit';

Sentry.init({/*...*/})

/** @type {import('@sveltejs/kit').HandleClientError} */
export async function handleError({ error, event, status, message }) {
	const errorId = crypto.randomUUID();

	Sentry.captureException(error, {
		extra: { event, errorId, status }
	});

	return {
		message: 'Whoops!',
		errorId
	};
}
```

Customize error shape via `App.Error` interface:

```ts
/// file: src/app.d.ts
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId: string;
		}
	}
}

export {};
```

> **Note**: `handleError` must never throw. Not called for expected errors (using `error()` from `@sveltejs/kit`).

### init

Runs once at server creation or app start. For async initialization:

```js
/// file: src/hooks.server.js
import * as db from '$lib/server/database';

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
	await db.connect();
}
```

## Universal hooks

In `src/hooks.js`, runs on both server and client:

### reroute

Changes URL-to-route translation. Runs before `handle`:

```js
/// file: src/hooks.js
/** @type {Record<string, string>} */
const translated = {
	'/en/about': '/en/about',
	'/de/ueber-uns': '/de/about',
	'/fr/a-propos': '/fr/about',
};

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
	if (url.pathname in translated) {
		return translated[url.pathname];
	}
}
```

Can be async (since v2.18):

```js
/// file: src/hooks.js
/** @type {import('@sveltejs/kit').Reroute} */
export async function reroute({ url, fetch }) {
	if (url.pathname === '/api/reroute') return;

	const api = new URL('/api/reroute', url);
	api.searchParams.set('pathname', url.pathname);

	const result = await fetch(api).then(r => r.json());
	return result.pathname;
}
```

> **Note**: `reroute` is pure/idempotent. Result is cached per unique URL on client.

### transport

Pass custom types across server/client boundary:

```js
/// file: src/hooks.js
import { Vector } from '$lib/math';

/** @type {import('@sveltejs/kit').Transport} */
export const transport = {
	Vector: {
		encode: (value) => value instanceof Vector && [value.x, value.y],
		decode: ([x, y]) => new Vector(x, y)
	}
};
```