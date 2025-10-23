# adapter-auto

`adapter-auto` is installed by default with `npx sv create`. It automatically detects and uses the correct adapter for supported platforms at deploy time:

- `@sveltejs/adapter-cloudflare` - Cloudflare Pages
- `@sveltejs/adapter-netlify` - Netlify
- `@sveltejs/adapter-vercel` - Vercel
- `svelte-adapter-azure-swa` - Azure Static Web Apps
- `svelte-kit-sst` - AWS via SST
- `@sveltejs/adapter-node` - Google Cloud Run

**Best practice:** Install the specific adapter to `devDependencies` once you've chosen a platform for better lockfile management and faster CI installs.

## Configuration

`adapter-auto` accepts no options. To configure adapter-specific options (e.g., `{ edge: true }` for Vercel/Netlify), install and use the underlying adapter directly.

## Extending

Add support for more adapters by editing [adapters.js](https://github.com/sveltejs/kit/blob/main/packages/adapter-auto/adapters.js) and submitting a PR.