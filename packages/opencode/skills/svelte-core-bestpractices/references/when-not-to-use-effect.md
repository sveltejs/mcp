## When not to use `$effect`

In general, `$effect` is best considered something of an escape hatch — useful for things like analytics and direct DOM manipulation — rather than a tool you should use frequently. In particular, avoid using it to synchronise state. Instead of this...

```svelte
<script>
	let count = $state(0);
	let doubled = $state();

	// don't do this!
	$effect(() => {
		doubled = count * 2;
	});
</script>
```

...do this:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>
```

> [!NOTE] For things that are more complicated than a simple expression like `count * 2`, you can also use `$derived.by`.

If you're using an effect because you want to be able to reassign the derived value (to build an optimistic UI, for example) note that deriveds can be directly overridden as of Svelte 5.25.

You might be tempted to do something convoluted with effects to link one value to another. The following example shows two inputs for "money spent" and "money left" that are connected to each other. If you update one, the other should update accordingly. Don't use effects for this:

```svelte
<script>
	const total = 100;
	let spent = $state(0);
	let left = $state(total);

	$effect(() => {
		left = total - spent;
	});

	$effect(() => {
		spent = total - left;
	});
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" bind:value={left} max={total} />
	{left}/{total} left
</label>
```

Instead, use `oninput` callbacks or — better still — [function bindings](bind#Function-bindings) where possible:

```svelte
<script>
	const total = 100;
	let spent = $state(0);
	let left = $derived(total - spent);

+++	function updateLeft(left) {
		spent = total - left;
	}+++
</script>

<label>
	<input type="range" bind:value={spent} max={total} />
	{spent}/{total} spent
</label>

<label>
	<input type="range" +++bind:value="{(() => left, updateLeft)}+++" max={total} />
	{left}/{total} left
</label>
```

If you absolutely have to update `$state` within an effect and run into an infinite loop because you read and write to the same `$state`, use [untrack](svelte#untrack).
