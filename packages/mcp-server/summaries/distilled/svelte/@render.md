# {@render}

Renders a [snippet](snippet) using `{@render ...}` tag.

## Basic usage

```svelte
{#snippet sum(a, b)}
	<p>{a} + {b} = {a + b}</p>
{/snippet}

{@render sum(1, 2)}
{@render sum(3, 4)}
{@render sum(5, 6)}
```

Expression can be an identifier or any JavaScript expression:

```svelte
{@render (cool ? coolSnippet : lameSnippet)()}
```

## Optional snippets

Use optional chaining for potentially undefined snippets (e.g., props):

```svelte
{@render children?.()}
```

Or use `{#if}` with `:else` for fallback content:

```svelte
{#if children}
	{@render children()}
{:else}
	<p>fallback content</p>
{/if}
```