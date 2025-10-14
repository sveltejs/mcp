# Components

Components are written in `.svelte` files. All three sections (script, styles, markup) are optional.

```svelte
/// file: MyComponent.svelte
<script module>
	// module-level logic goes here
	// (you will rarely use this)
</script>

<script>
	// instance-level logic goes here
</script>

<!-- markup (zero or more items) goes here -->

<style>
	/* styles go here */
</style>
```

## `<script>`

Runs when component instance is created. Top-level variables can be referenced in markup.

Use runes for props and reactivity.

## `<script module>`

Runs once when module first evaluates (not per instance). Variables declared here can be referenced in component, but not vice versa.

```svelte
<script module>
	let total = 0;
</script>

<script>
	total += 1;
	console.log(`instantiated ${total} times`);
</script>
```

Can `export` bindings (becomes module exports). Cannot `export default` (component is default export).

> **Note:** In Svelte 4, this was `<script context="module">`

## `<style>`

CSS is scoped to the component.

```svelte
<style>
	p {
		/* this will only affect <p> elements in this component */
		color: burlywood;
	}
</style>
```