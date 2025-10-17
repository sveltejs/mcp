# adapter-static

Use SvelteKit as a static site generator (SSG) with [`adapter-static`](https://github.com/sveltejs/kit/tree/main/packages/adapter-static). Prerender entire site as static files.

## Usage

Install: `npm i -D @sveltejs/adapter-static`

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	}
};

export default config;
```

Enable prerendering in root layout:

```js
/// file: src/routes/+layout.js
export const prerender = true;
```

**Important:** Set [`trailingSlash`](page-options#trailingSlash) correctly. If host doesn't render `/a.html` for `/a` requests, use `trailingSlash: 'always'` to create `/a/index.html`.

## Zero-config support

Platforms like Vercel auto-configure. Omit options:

```js
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

## Options

- **pages**: Output directory for prerendered pages (default: `build`)
- **assets**: Output directory for static assets (default: same as `pages`)
- **fallback**: Filename for SPA entry point (e.g., `200.html`). Avoid `index.html`. Has negative performance/SEO impact. See [single page apps](single-page-apps) docs.
- **precompress**: If `true`, generates `.br` and `.gz` files
- **strict**: If `true` (default), checks all pages prerendered or `fallback` set. Set `false` to skip check.

## GitHub Pages

For repos not named `your-username.github.io`, set [`config.kit.paths.base`](configuration#paths) to repo name (site served from `https://your-username.github.io/your-repo-name`).

```js
// @errors: 2322
/// file: svelte.config.js
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		}
	}
};

export default config;
```

Example GitHub Actions workflow:

```yaml
### file: .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: 'main'

jobs:
  build_site:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # If you're using pnpm, add this step then change the commands and cache key below to use `pnpm`
      # - name: Install pnpm
      #   uses: pnpm/action-setup@v3
      #   with:
      #     version: 8

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm i

      - name: build
        env:
          BASE_PATH: '/${{ github.event.repository.name }}'
        run: |
          npm run build

      - name: Upload Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          # this should match the `pages` option in your adapter-static options
          path: 'build/'

  deploy:
    needs: build_site
    runs-on: ubuntu-latest

    permissions:
      pages: write
      id-token: write

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

**Note:** If not using GitHub Actions, add empty `.nojekyll` file in `static` directory.