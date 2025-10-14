# Legacy Mode Reactivity

## Auto-reactive Variables

In legacy mode (non-runes), top-level component variables are automatically reactive. Reassignment/mutation triggers UI updates.

```svelte
<script>
	let count = 0;
</script>

<button on:click={() => count += 1}>
	clicks: {count}
</button>
```

## Gotcha: Array Methods

Array methods like `.push()` and `.splice()` don't trigger updates. Requires subsequent assignment:

```svelte
<script>
	let numbers = [1, 2, 3, 4];

	function addNumber() {
		// this method call does not trigger an update
		numbers.push(numbers.length + 1);

		// this assignment will update anything
		// that depends on `numbers`
		numbers = numbers;
	}
</script>
```