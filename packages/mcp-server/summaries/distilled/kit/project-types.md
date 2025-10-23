# Rendering & Deployment

SvelteKit supports multiple rendering modes and deployment targets. Rendering is controlled by your adapter choice and configuration. Project structure and routing remain the same across all types.

## Default Rendering

- First page: [SSR](glossary#SSR) (server-side rendering)
- Subsequent pages: [CSR](glossary#CSR) (client-side rendering)
- Benefits: Better SEO, faster navigation, no flash between pages
- Also called "transitional apps"

## Static Site Generation (SSG)

- Use [`adapter-static`](adapter-static) to prerender entire site
- Or use [prerender option](page-options#prerender) for specific pages only
- For very large sites: Use [ISR with `adapter-vercel`](adapter-vercel#Incremental-Static-Regeneration)
- Can mix rendering types across pages

## Single-Page App (SPA)

- CSR only
- See [single-page apps guide](single-page-apps)
- Skip `server` file documentation if no backend needed

## Multi-Page App (MPA)

- Not typical for SvelteKit
- Use [`csr = false`](page-options#csr) to remove JS and force server rendering
- Or use [`data-sveltekit-reload`](link-options#data-sveltekit-reload) for specific server-rendered links

## Separate Backend

If backend is in another language (Go, Java, PHP, Ruby, Rust, C#):
- **Recommended**: Deploy frontend separately with `adapter-node` or serverless adapter
- Alternative: Deploy as SPA served by backend (worse SEO/performance)
- Skip `server` file docs
- See [FAQ on external backends](faq#How-do-I-use-a-different-backend-API-server)

## Deployment Targets

**Serverless**: 
- [adapter-auto](adapter-auto) (zero config)
- [`adapter-vercel`](adapter-vercel), [`adapter-netlify`](adapter-netlify), [`adapter-cloudflare`](adapter-cloudflare)
- Some support `edge` option for [edge rendering](glossary#Edge)

**Your Server/VPS**: [`adapter-node`](adapter-node)

**Container**: [`adapter-node`](adapter-node) for Docker/LXC

**Library**: Use [`@sveltejs/package`](packaging) with [`sv create`](/docs/cli/sv-create)

**Offline/PWA**: Full [service worker](service-workers) support

**Mobile**: Convert SPA with [Tauri](https://v2.tauri.app/start/frontend/sveltekit/) or [Capacitor](https://capacitorjs.com/solution/svelte)
- Use [`bundleStrategy: 'single'`](configuration#output) to reduce requests (helpful for HTTP/1 servers)

**Desktop**: Convert SPA with [Tauri](https://v2.tauri.app/start/frontend/sveltekit/), [Wails](https://wails.io/docs/guides/sveltekit/), or [Electron](https://www.electronjs.org/)

**Browser Extension**: Use [`adapter-static`](adapter-static) or [community adapters](/packages#sveltekit-adapters)

**Embedded Devices**: Svelte runs on low-power devices. Use [`bundleStrategy: 'single'`](configuration#output) to limit concurrent connections