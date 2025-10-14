# Integrations

## `vitePreprocess`

Enables Vite-supported CSS flavors: PostCSS, SCSS, Less, Stylus, SugarSS. Included by default in TypeScript projects.

```js
// svelte.config.js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess()]
};

export default config;
```

**TypeScript notes:**
- Svelte 4: Requires preprocessor
- Svelte 5: Native support for type syntax only. For complex TS syntax, use `vitePreprocess({ script: true })`

## Add-ons

Run `npx sv add` to setup integrations:
- prettier, eslint, vitest, playwright
- lucia (auth), tailwind, drizzle (DB)
- paraglide (i18n), mdsvex (markdown), storybook

## Packages

See [packages page](/packages) or [sveltesociety.dev](https://sveltesociety.dev/) for libraries and resources.

## `svelte-preprocess`

Alternative to `vitePreprocess` with additional features: Pug, Babel, global styles. May be slower and need more config. CoffeeScript not supported.

Install: `npm i -D svelte-preprocess` + add to `svelte.config.js` + install language library (e.g., `npm i -D sass`)

## Vite Plugins

Use any Vite plugin. See [`vitejs/awesome-vite`](https://github.com/vitejs/awesome-vite?tab=readme-ov-file#plugins).