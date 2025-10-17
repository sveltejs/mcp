# Legacy Props Access

## `$$props` and `$$restProps`

In **legacy mode** (not runes mode), use these special variables to access props:

- **`$$props`** - all props passed to component, including undeclared ones
- **`$$restProps`** - all props except those declared with `export`

### Example

```svelte
<script>
	export let variant;
</script>

<button {...$$restProps} class="variant-{variant} {$$props.class ?? ''}">
	click me
</button>

<style>
	.variant-danger {
		background: red;
	}
</style>
```

**Note:** In Svelte 3/4, `$$props` and `$$restProps` have performance cost. Use only when needed.

**Runes mode:** Use [`$props`]($props) rune instead.