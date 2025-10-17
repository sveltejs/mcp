# Legacy Props

## Declaring Props

In legacy mode (non-runes), use `export` to declare props:

```svelte
<script>
	export let foo;
	export let bar = 'default value';

	// Props are immediately available
	console.log({ foo });
</script>
```

**Key differences from runes mode:**
- Default values apply only when prop is `undefined` at creation
- If parent changes prop from defined → `undefined`, it does NOT revert to default

**Required props:** Props without defaults are required. Svelte warns if missing. To silence warning:

```js
export let foo = undefined;
```

## Component Exports

Exported `const`, `class`, or `function` become component API (not props):

```svelte
<!--- file: Greeter.svelte--->
<script>
	export function greet(name) {
		alert(`hello ${name}!`);
	}
</script>
```

```svelte
<!--- file: App.svelte --->
<script>
	import Greeter from './Greeter.svelte';

	let greeter;
</script>

<Greeter bind:this={greeter} />

<button on:click={() => greeter.greet('world')}>
	greet
</button>
```

## Renaming Props

Use separate `export` to rename props (useful for reserved words):

```svelte
<script>
	/** @type {string} */
	let className;

	// Creates a `class` prop
	export { className as class };
</script>
```