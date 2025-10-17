# `<svelte:options>`

```svelte
<svelte:options option={value} />
```

Specifies per-component compiler options.

## Options

- `runes={true}` — forces runes mode
- `runes={false}` — forces legacy mode
- `namespace="..."` — namespace for component: `"html"` (default), `"svg"`, or `"mathml"`
- `customElement={...}` — options for compiling as custom element. String value sets `tag` option
- `css="injected"` — injects styles inline: `<style>` tag in `head` during SSR, via JavaScript on client

## Example

```svelte
<svelte:options customElement="my-custom-element" />
```