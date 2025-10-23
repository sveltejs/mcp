# `<svelte:component>`

**Legacy mode only** - destroys and recreates component when `this` expression changes:

```svelte
<svelte:component this={MyComponent} />
```

If `this` is falsy, no component is rendered.

**Svelte 5 runes mode**: Use `<MyComponent>` directly - it re-renders automatically when the component value changes. `<svelte:component>` is no longer necessary.