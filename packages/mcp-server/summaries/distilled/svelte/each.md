# {#each} blocks

## Basic syntax

```svelte
{#each expression as name}...{/each}
{#each expression as name, index}...{/each}
```

Iterates over arrays, array-like objects (with `length`), or iterables (`Map`, `Set`, anything usable with `Array.from`).

```svelte
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

With index:

```svelte
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

## Keyed each blocks

```svelte
{#each expression as name (key)}...{/each}
{#each expression as name, index (key)}...{/each}
```

Keys uniquely identify items. Svelte uses them to intelligently insert/move/delete items instead of updating in place. Use strings or numbers for keys.

```svelte
{#each items as item (item.id)}
	<li>{item.name} x {item.qty}</li>
{/each}

{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

Destructuring and rest patterns work:

```svelte
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}

{#each objects as { id, ...rest }}
	<li><span>{id}</span><MyComponent {...rest} /></li>
{/each}

{#each items as [id, ...rest]}
	<li><span>{id}</span><MyComponent values={rest} /></li>
{/each}
```

## Without an item

```svelte
{#each expression}...{/each}
{#each expression, index}...{/each}
```

Render something `n` times without binding items:

```svelte
<div class="chess-board">
	{#each { length: 8 }, rank}
		{#each { length: 8 }, file}
			<div class:black={(rank + file) % 2 === 1}></div>
		{/each}
	{/each}
</div>
```

## {:else} clause

```svelte
{#each expression as name}...{:else}...{/each}
```

Renders when list is empty:

```svelte
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```