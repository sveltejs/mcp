# Snippets

Reusable chunks of markup inside components. Alternative to duplicative code.

## Syntax

```svelte
{#snippet name()}...{/snippet}
```

```svelte
{#snippet name(param1, param2, paramN)}...{/snippet}
```

## Basic Usage

```svelte
{#snippet figure(image)}
	<figure>
		<img src={image.src} alt={image.caption} width={image.width} height={image.height} />
		<figcaption>{image.caption}</figcaption>
	</figure>
{/snippet}

{#each images as image}
	{#if image.href}
		<a href={image.href}>
			{@render figure(image)}
		</a>
	{:else}
		{@render figure(image)}
	{/if}
{/each}
```

- Arbitrary number of parameters with default values
- Can destructure parameters
- **Cannot** use rest parameters

## Scope

Snippets reference values from `<script>` or `{#each}` blocks:

```svelte
<script>
	let { message = `it's great to see you!` } = $props();
</script>

{#snippet hello(name)}
	<p>hello {name}! {message}!</p>
{/snippet}

{@render hello('alice')}
{@render hello('bob')}
```

Visible to siblings and children of siblings only:

```svelte
<div>
	{#snippet x()}
		{#snippet y()}...{/snippet}
		{@render y()} <!-- fine -->
	{/snippet}
	
	{@render y()} <!-- error: not in scope -->
</div>

{@render x()} <!-- error: not in scope -->
```

Snippets can reference themselves (recursion):

```svelte
{#snippet countdown(n)}
	{#if n > 0}
		<span>{n}...</span>
		{@render countdown(n - 1)}
	{:else}
		{@render blastoff()}
	{/if}
{/snippet}
```

## Passing to Components

### Explicit props

```svelte
<script>
	import Table from './Table.svelte';
	const fruits = [
		{ name: 'apples', qty: 5, price: 2 },
		{ name: 'bananas', qty: 10, price: 1 }
	];
</script>

{#snippet header()}
	<th>fruit</th>
	<th>qty</th>
	<th>price</th>
{/snippet}

{#snippet row(d)}
	<td>{d.name}</td>
	<td>{d.qty}</td>
	<td>{d.price}</td>
{/snippet}

<Table data={fruits} {header} {row} />
```

### Implicit props

Snippets declared inside component tags become props:

```svelte
<Table data={fruits}>
	{#snippet header()}
		<th>fruit</th>
		<th>qty</th>
	{/snippet}

	{#snippet row(d)}
		<td>{d.name}</td>
		<td>{d.qty}</td>
	{/snippet}
</Table>
```

### Implicit `children` snippet

Content not in snippet declarations becomes `children`:

```svelte
<!--- file: App.svelte --->
<Button>click me</Button>
```

```svelte
<!--- file: Button.svelte --->
<script>
	let { children } = $props();
</script>

<button>{@render children()}</button>
```

> **Note:** Avoid props named `children` if you have content inside component tags

## Optional Snippets

Optional chaining:

```svelte
<script>
    let { children } = $props();
</script>

{@render children?.()}
```

With fallback:

```svelte
{#if children}
    {@render children()}
{:else}
    fallback content
{/if}
```

## TypeScript

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		data: any[];
		children: Snippet;
		row: Snippet<[any]>;
	}

	let { data, children, row }: Props = $props();
</script>
```

With generics:

```svelte
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let {
		data,
		children,
		row
	}: {
		data: T[];
		children: Snippet;
		row: Snippet<[T]>;
	} = $props();
</script>
```

## Exporting Snippets

Top-level snippets can be exported (Svelte 5.5+):

```svelte
<script module>
	export { add };
</script>

{#snippet add(a, b)}
	{a} + {b} = {a + b}
{/snippet}
```

**Restriction:** Cannot reference non-module `<script>` declarations

## Advanced

- Programmatic creation: [`createRawSnippet`](svelte#createRawSnippet) API
- Snippets replace deprecated Svelte 4 slots