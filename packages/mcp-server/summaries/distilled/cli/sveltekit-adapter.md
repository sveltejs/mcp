# SvelteKit Adapters

Adapters enable deployment to various platforms.

## Usage

```sh
npx sv add sveltekit-adapter
```

Installs and configures chosen adapter in `svelte.config.js`.

## Adapter Options

- `auto` — [`@sveltejs/adapter-auto`](/docs/kit/adapter-auto) - auto-selects adapter, less configurable
- `node` — [`@sveltejs/adapter-node`](/docs/kit/adapter-node) - standalone Node server
- `static` — [`@sveltejs/adapter-static`](/docs/kit/adapter-static) - static site generator (SSG)
- `vercel` — [`@sveltejs/adapter-vercel`](/docs/kit/adapter-vercel) - Vercel deployment
- `cloudflare` — [`@sveltejs/adapter-cloudflare`](/docs/kit/adapter-cloudflare) - Cloudflare deployment
- `netlify` — [`@sveltejs/adapter-netlify`](/docs/kit/adapter-netlify) - Netlify deployment

```sh
npx sv add sveltekit-adapter=adapter:node
```