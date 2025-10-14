# Performance

## Built-in Optimizations

SvelteKit automatically provides:
- Code-splitting
- Asset preloading
- File hashing for caching
- Request coalescing (groups server `load` functions into single HTTP request)
- Parallel loading for universal `load` functions
- Data inlining (replays server `fetch` in browser without new request)
- Conservative invalidation (only re-runs `load` when necessary)
- Prerendering
- Link preloading

## Diagnosing Issues

**Tools:**
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- Browser devtools: Lighthouse, Network, Performance tabs

**Important:** Test in preview mode after building, not dev mode.

**Instrumenting:** Use [OpenTelemetry](https://opentelemetry.io/) or [Server-Timing headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing) to debug slow API calls.

## Optimizing Assets

### Images
Use `@sveltejs/enhanced-img` package (see [images](images) page).

### Videos
- Compress with [Handbrake](https://handbrake.fr/), convert to `.webm` or `.mp4`
- Lazy-load below-the-fold videos: `preload="none"`
- Strip audio from muted videos with [FFmpeg](https://ffmpeg.org/)

### Fonts
SvelteKit doesn't preload fonts by default. Preload in `handle` hook with `resolve` and `preload` filter. [Subset fonts](https://web.dev/learn/performance/optimize-web-fonts#subset_your_web_fonts) to reduce size.

## Reducing Code Size

### Svelte Version
Use latest version. Svelte 5 < Svelte 4 < Svelte 3 (size and speed).

### Packages
Use [`rollup-plugin-visualizer`](https://www.npmjs.com/package/rollup-plugin-visualizer) to identify large packages. Inspect build output with `build: { minify: false }` in Vite config.

### External Scripts
Minimize third-party scripts. Use server-side analytics (Cloudflare, Netlify, Vercel). Run scripts in web worker with [Partytown's SvelteKit integration](https://partytown.builder.io/sveltekit).

### Selective Loading
Use dynamic `import(...)` for conditional code instead of static `import`.

## Navigation

### Preloading
Configure [link options](link-options) for eager preloading (default on `<body>`).

### Non-essential Data
Return promises in `load` functions for slow data. Server `load` functions will [stream](load#Streaming-with-promises) data after navigation.

### Preventing Waterfalls

**Waterfalls** = sequential requests that kill performance.

**Browser waterfalls:**
- SvelteKit adds `modulepreload` tags/headers automatically
- Check network tab for additional preload needs
- Manually handle web fonts
- **Avoid SPA mode** — creates waterfalls (empty page → JS → render)

**Backend waterfalls:**
- Use [server `load` functions](load#Universal-vs-server) to make backend requests from server, not browser
- Use database joins instead of sequential queries

## Hosting

- Locate frontend in same data center as backend
- Use edge deployment (many adapters support this, some [per-route](page-options#config))
- Use CDN for images (often automatic)
- Ensure HTTP/2 or newer for parallel file loading

## Further Reading

[Core Web Vitals](https://web.dev/explore/learn-core-web-vitals)