# SvelteKit Introduction

## What is SvelteKit?

Framework for building robust, performant web apps using Svelte. Similar to Next (React) or Nuxt (Vue).

## What is Svelte?

UI component framework. Compiler converts components to JavaScript (renders HTML) and CSS. Components handle user interfaces like navigation bars, forms, etc.

## SvelteKit vs Svelte

**Svelte**: Renders UI components only.

**SvelteKit**: Full-featured framework providing:
- Router
- [Build optimizations](https://vitejs.dev/guide/features.html#build-optimizations) - minimal code loading
- [Offline support](service-workers)
- [Preloading](link-options#data-sveltekit-preload-data) - fetch before navigation
- [Configurable rendering](page-options):
  - [SSR](glossary#SSR) - server-side rendering
  - [CSR](glossary#CSR) - client-side rendering  
  - [Prerendering](glossary#Prerendering) - build-time rendering
- [Image optimization](images)
- [Vite](https://vitejs.dev/) + [HMR](https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#hot) for instant dev updates

See [project types](project-types) for application examples.