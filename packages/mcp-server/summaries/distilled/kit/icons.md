# Icons

## CSS Approach
Use Iconify's CSS-based icons from [popular icon sets](https://icon-sets.iconify.design/). Supports [Tailwind CSS](https://iconify.design/docs/usage/css/tailwind/) and [UnoCSS](https://iconify.design/docs/usage/css/unocss/) plugins. No imports needed in `.svelte` files.

## Svelte Libraries
**Avoid** libraries with one `.svelte` file per icon - thousands of `.svelte` files severely slow Vite's dependency optimization, especially with mixed umbrella/subpath imports.

See [icon libraries](/packages#icons) for options.