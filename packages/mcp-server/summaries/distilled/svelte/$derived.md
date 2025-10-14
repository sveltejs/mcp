# Derived State

## `$derived`

Creates reactive derived values that automatically update when dependencies change:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

**Key points:**
- Expression must be side-effect free (no `count++`)
- Can mark class fields as `$derived`
- Without `$derived`, values don't update when dependencies change

## `$derived.by`

For complex derivations requiring multiple statements:

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

`$derived(expression)` equals `$derived.by(() => expression)`

## Dependencies

Anything read synchronously inside `$derived` is a dependency. Use `untrack` to exempt state from being a dependency.

## Overriding Derived Values

Can temporarily reassign derived values (unless `const`) for optimistic UI:

```svelte
<script>
	let { post, like } = $props();

	let likes = $derived(post.likes);

	async function onclick() {
		// increment the `likes` count immediately...
		likes += 1;

		// and tell the server, which will eventually update `post`
		try {
			await like();
		} catch {
			// failed! roll back the change
			likes -= 1;
		}
	}
</script>

<button {onclick}>🧡 {likes}</button>
```

## Deriveds and Reactivity

Unlike `$state`, `$derived` values aren't converted to deep proxies. Mutating a derived object affects the original:

```svelte
let items = $state([...]);

let index = $state(0);
let selected = $derived(items[index]);
```

Mutating `selected` affects `items` array.

## Destructuring

Destructured variables are all reactive:

```js
let { a, b, c } = $derived(stuff());
```

Equivalent to:

```js
let _stuff = $derived(stuff());
let a = $derived(_stuff.a);
let b = $derived(_stuff.b);
let c = $derived(_stuff.c);
```

## Update Propagation

**Push-pull reactivity:** Dependencies are notified immediately (push), but derived values only re-evaluate when read (pull).

If derived value is referentially identical to previous, downstream updates skip:

```svelte
<script>
	let count = $state(0);
	let large = $derived(count > 10);
</script>

<button onclick={() => count++}>
	{large}
</button>
```

Button only updates when `large` changes, not `count`.