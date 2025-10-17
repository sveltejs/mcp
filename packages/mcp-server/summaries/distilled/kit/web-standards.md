# Web APIs

SvelteKit builds on standard Web APIs. These work in modern browsers and non-browser environments (Cloudflare Workers, Deno, Vercel Functions, Node via polyfills).

## Fetch APIs

[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) is available in hooks, server routes, and browser.

> [!NOTE] 
> Special `fetch` in `load` functions, server hooks, and API routes:
> - Invokes endpoints directly during SSR (no HTTP call)
> - Preserves credentials automatically
> - Allows relative requests (normally requires fully qualified URL)
> - For credentialled fetches outside `load`, explicitly pass `cookie`/`authorization` headers

### Request

[`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) available as `event.request` in hooks and server routes. Use `request.json()` and `request.formData()` to get posted data.

### Response

[`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) returned from `await fetch(...)` and `+server.js` handlers. SvelteKit turns a `Request` into a `Response`.

### Headers

[`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) interface for reading `request.headers` and setting `response.headers`:

```js
// @errors: 2461
/// file: src/routes/what-is-my-user-agent/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET({ request }) {
	// log all headers
	console.log(...request.headers);

	// create a JSON Response using a header we received
	return json({
		// retrieve a specific header
		userAgent: request.headers.get('user-agent')
	}, {
		// set a header on the response
		headers: { 'x-custom-header': 'potato' }
	});
}
```

## FormData

[`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) for HTML form submissions:

```js
// @errors: 2461
/// file: src/routes/hello/+server.js
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
	const body = await event.request.formData();

	// log all fields
	console.log([...body]);

	return json({
		// get a specific field's value
		name: body.get('name') ?? 'world'
	});
}
```

## Stream APIs

For large/chunked responses: [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream), [WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream), [TransformStream](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream).

## URL APIs

[`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) interface with `origin`, `pathname`, `hash` properties. Available as:
- `event.url` in hooks/server routes
- `page.url` in pages
- `from`/`to` in `beforeNavigate`/`afterNavigate`

### URLSearchParams

Access query parameters via `url.searchParams` ([`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)):

```js
const foo = url.searchParams.get('foo');
```

## Web Crypto

[Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) via `crypto` global:

```js
const uuid = crypto.randomUUID();
```