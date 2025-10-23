# SvelteKit Rendering

## Key Terms

### CSR (Client-Side Rendering)
Page generation in the browser using JavaScript. Enabled by default.
- Disable with `csr = false` page option

### SSR (Server-Side Rendering)
Page generation on the server. Enabled by default. Improves performance and SEO.
- Disable with `ssr = false` page option

### Hybrid App (Default)
SvelteKit's default mode: initial HTML from server (SSR), then subsequent navigations via CSR.

### Hydration
Process where client-side components initialize with server-sent data, attach event listeners, and become interactive. Data fetched during SSR is transmitted to client to avoid duplicate API calls.
- Disabled when `csr = false`

### Prerendering
Computing page contents at build time, saving HTML. Same content served to all users.
- **Rule**: Any two users must get identical content; page cannot contain actions
- Can include personalized content if fetched client-side
- Control with `prerender` page option or config in `svelte.config.js`

### SSG (Static Site Generation)
Every page is prerendered. No SSR servers needed, served from CDNs.
- Use `adapter-static` or set all pages to prerender

### ISR (Incremental Static Regeneration)
Generate static pages on-demand as visitors request them. Reduces build times vs full SSG.
- Available with `adapter-vercel`

### Routing (Client-Side)
SvelteKit intercepts navigation and updates page on client instead of server requests. Enabled by default.
- Skip with `data-sveltekit-reload` attribute

### SPA (Single-Page App)
Empty HTML shell on initial request, all rendering client-side. **Not recommended** due to performance/SEO impacts.
- Build with `adapter-static`

### Edge
Rendering in CDN near user for lower latency.

### MPA (Multi-Page App)
Traditional server-rendered apps (non-JavaScript).

### PWA (Progressive Web App)
Web app functioning like native app. Can be installed, use service workers for offline capability.