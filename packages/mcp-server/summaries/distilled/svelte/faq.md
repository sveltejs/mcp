# Svelte FAQ

## Getting Started
- Start with the interactive [tutorial](/tutorial) - 5-10 minutes to get running, 1.5 hours for full tutorial
- [Reference docs](/docs/svelte) for syntax questions

## Support
- **Stack Overflow**: Code-level questions, tagged [Svelte](https://stackoverflow.com/questions/tagged/svelte+or+svelte-3)
- **Discussion**: [Discord](/chat), [Reddit](https://www.reddit.com/r/sveltejs/)
- **Resources**: [Svelte Society books/videos](https://sveltesociety.dev/resources)

## Tooling
- **VS Code**: [Official extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- **Formatting**: [prettier-plugin-svelte](https://www.npmjs.com/package/prettier-plugin-svelte)

## Component Documentation
Use JSDoc comments for hover documentation:

````svelte
<script>
	/** What should we call the user? */
	export let name = 'world';
</script>

<!--
@component
Here's some documentation for this component.
It will show up on hover.

- You can use markdown here.
- You can also use code blocks here.
- Usage:
  ```svelte
  <main name="Arethra">
  ```
-->
<main>
	<h1>
		Hello, {name}
	</h1>
</main>
````

**Note**: `@component` is required in HTML comments.

## Testing
Three test types:

1. **Unit Tests**: Business logic in isolation. Use [Vitest](https://vitest.dev/) or similar.
2. **Component Tests**: Mount/interaction testing. Use Vitest + jsdom, [Playwright](https://playwright.dev/docs/test-components), or [Cypress](https://www.cypress.io/).
3. **E2E Tests**: Full application testing. Use [Playwright](https://playwright.dev/) or alternatives.

Resources:
- [Svelte testing docs](/docs/svelte/testing)
- [Vitest setup via CLI](/docs/cli/vitest)
- [Svelte Testing Library](https://testing-library.com/docs/svelte-testing-library/example/)

## Routing
- **Official**: [SvelteKit](/docs/kit) - filesystem router with SSR and HMR
- **Alternatives**: See [packages page](/packages#routing)

## Mobile Apps
- Convert [SvelteKit SPA](https://kit.svelte.dev/docs/single-page-apps) to mobile with [Tauri](https://v2.tauri.app/start/frontend/sveltekit/) or [Capacitor](https://capacitorjs.com/solution/svelte)
- **Note**: Svelte Native not supported in Svelte 5

## UI Components
- Multiple [UI libraries](/packages#component-libraries) and standalone components on [packages page](/packages)

## Style Scoping
Svelte removes unused styles to prevent scoping issues. For dynamic/child component styles, use `:global(...)`:

```css
.foo :global(.bar) { ... }
```

This styles `.bar` elements within component's `.foo` elements.

## HMR
Use [SvelteKit](/docs/kit) (built on [Vite](https://vitejs.dev/) and [svelte-hmr](https://github.com/sveltejs/svelte-hmr)). Community plugins: [rollup](https://github.com/rixo/rollup-plugin-svelte-hot), [webpack](https://github.com/sveltejs/svelte-loader).