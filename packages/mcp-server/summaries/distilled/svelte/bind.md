# Bindings

`bind:` directive allows data to flow from child to parent (reverse of normal flow).

## Syntax

```svelte
<input bind:value={value} />
<input bind:value /> <!-- shorthand when names match -->
```

Svelte creates event listeners to update bound values. Most bindings are two-way; some are readonly.

## Function Bindings

Use `bind:property={get, set}` for validation/transformation:

```svelte
<input bind:value={
	() => value,
	(v) => value = v.toLowerCase()}
/>
```

For readonly bindings, set `get` to `null`:

```svelte
<div
	bind:clientWidth={null, redraw}
	bind:clientHeight={null, redraw}
>...</div>
```

> Available in Svelte 5.9.0+

## `<input bind:value>`

```svelte
<script>
	let message = $state('hello');
</script>

<input bind:value={message} />
<p>{message}</p>
```

Numeric inputs (`type="number"` or `type="range"`) coerce to numbers. Empty/invalid inputs are `undefined`.

Since 5.6.0: `defaultValue` attribute sets reset value for forms (takes precedence over empty string). Binding value takes precedence on initial render unless `null`/`undefined`.

```svelte
<script>
	let value = $state('');
</script>

<form>
	<input bind:value defaultValue="not the empty string">
	<input type="reset" value="Reset">
</form>
```

## `<input bind:checked>`

```svelte
<label>
	<input type="checkbox" bind:checked={accepted} />
	Accept terms and conditions
</label>
```

Since 5.6.0: `defaultChecked` sets reset value for forms.

> Use `bind:group` for radio inputs, not `bind:checked`

## `<input bind:indeterminate>`

```svelte
<script>
	let checked = $state(false);
	let indeterminate = $state(true);
</script>

<form>
	<input type="checkbox" bind:checked bind:indeterminate>

	{#if indeterminate}
		waiting...
	{:else if checked}
		checked
	{:else}
		unchecked
	{/if}
</form>
```

## `<input bind:group>`

```svelte
<script>
	let tortilla = $state('Plain');

	/** @type {string[]} */
	let fillings = $state([]);
</script>

<!-- grouped radio inputs are mutually exclusive -->
<label><input type="radio" bind:group={tortilla} value="Plain" /> Plain</label>
<label><input type="radio" bind:group={tortilla} value="Whole wheat" /> Whole wheat</label>
<label><input type="radio" bind:group={tortilla} value="Spinach" /> Spinach</label>

<!-- grouped checkbox inputs populate an array -->
<label><input type="checkbox" bind:group={fillings} value="Rice" /> Rice</label>
<label><input type="checkbox" bind:group={fillings} value="Beans" /> Beans</label>
<label><input type="checkbox" bind:group={fillings} value="Cheese" /> Cheese</label>
<label><input type="checkbox" bind:group={fillings} value="Guac (extra)" /> Guac (extra)</label>
```

> Only works if inputs are in same component

## `<input bind:files>`

```svelte
<script>
	let files = $state();

	function clear() {
		files = new DataTransfer().files; // null or undefined does not work
	}
</script>

<label for="avatar">Upload a picture:</label>
<input accept="image/png, image/jpeg" bind:files id="avatar" name="avatar" type="file" />
<button onclick={clear}>clear</button>
```

Must use `FileList` objects. Create via `DataTransfer` since `FileList` can't be constructed directly or modified.

## `<select bind:value>`

Binds to `value` property of selected `<option>` (any value type, not just strings):

```svelte
<select bind:value={selected}>
	<option value={a}>a</option>
	<option value={b}>b</option>
	<option value={c}>c</option>
</select>
```

`<select multiple>` binds to array:

```svelte
<select multiple bind:value={fillings}>
	<option>Rice</option>
	<option>Beans</option>
	<option>Cheese</option>
	<option>Guac (extra)</option>
</select>
```

Use `selected` attribute for default values (used on form reset). Binding value takes precedence on initial render unless `undefined`.

## `<audio>`

**Two-way bindings:**
- `currentTime`, `playbackRate`, `paused`, `volume`, `muted`

**Readonly bindings:**
- `duration`, `buffered`, `seekable`, `seeking`, `ended`, `readyState`, `played`

```svelte
<audio src={clip} bind:duration bind:currentTime bind:paused></audio>
```

## `<video>`

Same as `<audio>` plus readonly `videoWidth` and `videoHeight`.

## `<img>`

Readonly: `naturalWidth`, `naturalHeight`

## `<details bind:open>`

```svelte
<details bind:open={isOpen}>
	<summary>How do you comfort a JavaScript bug?</summary>
	<p>You console it.</p>
</details>
```

## Contenteditable Bindings

Elements with `contenteditable` support: `innerHTML`, `innerText`, `textContent`

```svelte
<div contenteditable="true" bind:innerHTML={html}></div>
```

## Dimensions

All visible elements have readonly bindings (measured with `ResizeObserver`):
- `clientWidth`, `clientHeight`, `offsetWidth`, `offsetHeight`
- `contentRect`, `contentBoxSize`, `borderBoxSize`, `devicePixelContentBoxSize`

```svelte
<div bind:offsetWidth={width} bind:offsetHeight={height}>
	<Chart {width} {height} />
</div>
```

> `display: inline` elements (except intrinsic dimensions like `<img>`) need different display style. CSS transforms don't trigger callbacks.

## bind:this

Get DOM node reference (available after mount, read in effects/event handlers):

```svelte
<script>
	/** @type {HTMLCanvasElement} */
	let canvas;

	$effect(() => {
		const ctx = canvas.getContext('2d');
		drawStuff(ctx);
	});
</script>

<canvas bind:this={canvas}></canvas>
```

Works with components too:

```svelte
<!--- file: App.svelte --->
<ShoppingCart bind:this={cart} />

<button onclick={() => cart.empty()}> Empty shopping cart </button>
```

```svelte
<!--- file: ShoppingCart.svelte --->
<script>
	// All instance exports are available on the instance object
	export function empty() {
		// ...
	}
</script>
```

> With function bindings, getter is required for proper nullification on destruction.

## Component Property Bindings

Bind to component props:

```svelte
<Keypad bind:value={pin} />
```

Mark properties as bindable with `$bindable()`:

```svelte
<script>
	let { readonlyProperty, bindableProperty = $bindable() } = $props();
</script>
```

Bindable properties _can_ use `bind:`, not _must_.

Fallback values:

```svelte
<script>
	let { bindableProperty = $bindable('fallback value') } = $props();
</script>
```

Fallback only applies when not bound. When bound with fallback, parent must provide non-`undefined` value or runtime error occurs.