# `<svelte:element>`

Renders a dynamic element determined at runtime.

```svelte
<svelte:element this={expression} />
```

## Usage

Use when element type is unknown at author time (e.g., from CMS). Properties and event listeners apply to the rendered element.

```svelte
<script>
	let tag = $state('hr');
</script>

<svelte:element this={tag}>
	This text cannot appear inside an hr element
</svelte:element>
```

## Key Points

- **Only `bind:this` supported** - built-in bindings don't work with generic elements
- **Nullish values** - if `this` is null/undefined, element and children won't render
- **Void elements** - runtime error if void element (e.g., `br`, `hr`) has children
- **Valid DOM tags only** - `#text` or `svelte:head` won't work

## Namespace

Explicitly set namespace when Svelte can't infer:

```svelte
<svelte:element this={tag} xmlns="http://www.w3.org/2000/svg" />
```