# $host Rune

The `$host` rune provides access to the host element when compiling a component as a custom element.

## Usage

```svelte
/// file: Stepper.svelte
<svelte:options customElement="my-stepper" />

<script>
	function dispatch(type) {
		$host().dispatchEvent(new CustomEvent(type));
	}
</script>

<button onclick={() => dispatch('decrement')}>decrement</button>
<button onclick={() => dispatch('increment')}>increment</button>
```

```svelte
/// file: App.svelte
<script>
	import './Stepper.svelte';

	let count = $state(0);
</script>

<my-stepper
	ondecrement={() => count -= 1}
	onincrement={() => count += 1}
></my-stepper>

<p>count: {count}</p>
```

**Key points:**
- Only available in custom element components (requires `<svelte:options customElement="..." />`)
- Commonly used to dispatch custom events from the host element
- `$host()` is a global rune, no import needed