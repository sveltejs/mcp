# Component Styles

## Top-level `<style>` tag

- Only **one** top-level `<style>` tag allowed per component
- Top-level styles are scoped and processed

## Nested `<style>` tags

- `<style>` tags can be nested inside elements or logic blocks
- **No scoping or processing** - inserted as-is into DOM
- Styles apply globally

```svelte
<div>
	<style>
		/* this style tag will be inserted as-is */
		div {
			/* this will apply to all `<div>` elements in the DOM */
			color: red;
		}
	</style>
</div>
```