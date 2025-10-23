# Netlify Adapter

Deploy to Netlify using [`adapter-netlify`](https://github.com/sveltejs/kit/tree/main/packages/adapter-netlify). Auto-installed with `adapter-auto`.

## Usage

Install: `npm i -D @sveltejs/adapter-netlify`

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// default options are shown
		adapter: adapter({
			// if true, will create a Netlify Edge Function rather
			// than using standard Node-based functions
			edge: false,

			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app.
			// if `edge` is true, this option cannot be used
			split: false
		})
	}
};

export default config;
```

Requires `netlify.toml` in project root:

```toml
[build]
	command = "npm run build"
	publish = "build"
```

Default publish directory is `"build"` if not specified.

## Edge Functions

Set `edge: true` for Deno-based edge functions (deployed close to visitors). Default `false` uses Node-based functions.

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// will create a Netlify Edge Function using Deno-based
			// rather than using standard Node-based functions
			edge: true
		})
	}
};

export default config;
```

## Netlify-Specific Features

### Headers & Redirects

Place `_headers` and `_redirects` files in project root for static assets.

**Gotchas:**
- `_redirects` has higher priority than `[[redirects]]` in `netlify.toml`
- Don't add catch-all rules like `/* /foobar/:splat` - they'll prevent auto-appended rules from working
- Only first matching rule is processed

### Forms

1. Create HTML form with hidden `form-name` input
2. Prerender the page (`export const prerender = true`) - Netlify's bot parses HTML at deploy time
3. Prerender custom success pages if specified

### Functions

Access Netlify context (including Identity info) via `event.platform.context`:

```js
// @errors: 2339
// @filename: ambient.d.ts
/// <reference types="@sveltejs/adapter-netlify" />
// @filename: +page.server.js
// ---cut---
/// file: +page.server.js
/** @type {import('./$types').PageServerLoad} */
export const load = async (event) => {
	const context = event.platform?.context;
	console.log(context); // shows up in your functions log in the Netlify app
};
```

Add custom functions via `netlify.toml`:

```toml
[build]
	command = "npm run build"
	publish = "build"

[functions]
	directory = "functions"
```

## Troubleshooting

**File system access:**
- `fs` doesn't work in edge deployments
- In serverless, files aren't copied to deployment
- Use `read()` from `$app/server` instead (works in both edge and serverless)
- Or prerender the routes