# SvelteKit Project Structure

## Directory Structure

```tree
my-project/
├ src/
│ ├ lib/
│ │ ├ server/          # Server-only code
│ │ └ [lib files]      # Utilities/components
│ ├ params/            # Param matchers
│ ├ routes/            # App routes
│ ├ app.html           # Page template
│ ├ error.html         # Error page
│ ├ hooks.client.js
│ ├ hooks.server.js
│ ├ service-worker.js
│ └ instrumentation.server.js
├ static/              # Static assets
├ tests/
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

## Key Directories

### src/lib
- Import via `$lib` alias
- `lib/server`: Server-only code, import via `$lib/server`. Client imports are blocked.

### src/routes
Contains app routes and colocated components.

### src/params
Param matchers for advanced routing.

## Key Files

### app.html
Page template with placeholders:
- `%sveltekit.head%` - `<link>`, `<script>`, `<svelte:head>` content
- `%sveltekit.body%` - Rendered markup (must be inside `<div>`, not directly in `<body>`)
- `%sveltekit.assets%` - `paths.assets` or relative to `paths.base`
- `%sveltekit.nonce%` - CSP nonce
- `%sveltekit.env.[NAME]%` - Environment variables (must start with `publicPrefix`, usually `PUBLIC_`)
- `%sveltekit.version%` - App version

### error.html
Fallback error page with placeholders:
- `%sveltekit.status%` - HTTP status
- `%sveltekit.error.message%` - Error message

### hooks.client.js / hooks.server.js
Client and server hooks.

### service-worker.js
Service worker code.

### instrumentation.server.js
Observability setup. Runs before app code (requires adapter support).

### package.json
Must include `@sveltejs/kit`, `svelte`, `vite` as `devDependencies`.
Must have `"type": "module"` (`.cjs` for CommonJS).

### svelte.config.js
Svelte and SvelteKit configuration.

### tsconfig.json
TypeScript config. Extends generated `.svelte-kit/tsconfig.json`. Use `typescript.config` setting for top-level changes.

### vite.config.js
Vite config using `@sveltejs/kit/vite` plugin.

## Other

### static/
Static assets served as-is (e.g., `robots.txt`, `favicon.png`).

### .svelte-kit/
Generated files (configurable via `outDir`). Can be deleted and regenerated.