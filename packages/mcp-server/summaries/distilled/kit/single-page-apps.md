# SPA Mode

Turn a SvelteKit app into a client-rendered SPA using a **fallback page** that serves URLs not handled by prerendered pages.

> **Warning:** SPA mode has major performance drawbacks:
> - Multiple network round trips before content shows
> - Poor SEO and Core Web Vitals
> - Inaccessible if JavaScript fails
> 
> Mitigate by prerendering as many pages as possible, especially your homepage.

## Usage

**1. Disable SSR:**

```js
/// file: src/routes/+layout.js
export const ssr = false;
```

**2. Configure adapter-static:**

Install: `npm i -D @sveltejs/adapter-static`

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '200.html' // may differ from host to host
		})
	}
};

export default config;
```

The `fallback` page is an HTML file that loads your app and navigates to the correct route. The filename depends on your host (e.g., `200.html` for Surge). Avoid `index.html` as it may conflict with prerendering.

> **Note:** Fallback page always uses absolute asset paths (starting with `/`) regardless of `paths.relative` config.

## Prerendering Individual Pages

Re-enable SSR and prerendering for specific pages:

```js
/// file: src/routes/my-prerendered-page/+page.js
export const prerender = true;
export const ssr = true;
```

These pages render at build time as static `.html` files—no Node server needed.

## Apache

Add `static/.htaccess` to route requests to fallback:

```
<IfModule mod_rewrite.c>
	RewriteEngine On
	RewriteBase /
	RewriteRule ^200\.html$ - [L]
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteCond %{REQUEST_FILENAME} !-d
	RewriteRule . /200.html [L]
</IfModule>
```