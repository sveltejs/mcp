# Reactive Statements (Legacy Mode)

> **Note:** In runes mode, use [`$derived`]($derived) and [`$effect`]($effect) instead.

## Basic Usage

In legacy mode, prefix top-level statements with `$:` to make them reactive. They run after `<script>` code and before rendering, then re-run when dependencies change.

```svelte
<script>
	let a = 1;
	let b = 2;

	// this is a 'reactive statement', and it will re-run
	// when `a`, `b` or `sum` change
	$: console.log(`${a} + ${b} = ${sum}`);

	// this is a 'reactive assignment' — `sum` will be
	// recalculated when `a` or `b` change. It is
	// not necessary to declare `sum` separately
	$: sum = a + b;
</script>
```

Statements are ordered topologically by dependencies. `sum` calculates first despite appearing later.

## Multiple Statements

Use blocks for multiple statements:

```js
// @noErrors
$: {
	// recalculate `total` when `items` changes
	total = 0;

	for (const item of items) {
		total += item.value;
	}
}
```

## Destructuring

Left-hand side can be destructuring:

```js
// @noErrors
$: ({ larry, moe, curly } = stooges);
```

## Dependencies Gotcha

Dependencies are determined at **compile time** from variables referenced (not assigned) in the statement.

**Won't work** - indirect reference:
```js
// @noErrors
let count = 0;
let double = () => count * 2;

$: doubled = double();
```

**Won't work** - indirect dependency ordering:
```svelte
<script>
	let x = 0;
	let y = 0;

	$: z = y;
	$: setY(x);

	function setY(value) {
		y = value;
	}
</script>
```
Fix: Move `$: z = y` below `$: setY(x)`.

## Browser-Only Code

Reactive statements run during SSR. Wrap browser-only code:

```js
// @noErrors
$: if (browser) {
	document.title = title;
}
```