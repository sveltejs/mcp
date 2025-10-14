# SvelteKit CLI

SvelteKit uses [Vite](https://vitejs.dev) CLI via npm scripts:

- `vite dev` — dev server
- `vite build` — production build
- `vite preview` — preview production build

## svelte-kit sync

Creates `tsconfig.json` and generated types (importable as `./$types` in routing files). Runs automatically as `prepare` script in npm lifecycle.