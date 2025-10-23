# `<svelte:self>`

Allows a component to recursively include itself. Must be inside an `{#if}`, `{#each}` block, or slot to prevent infinite loops.

```svelte
<script>
	export let count;
</script>

{#if count > 0}
	<p>counting down... {count}</p>
	<svelte:self count={count - 1} />
{:else}
	<p>lift-off!</p>
{/if}
```

**Note:** Obsolete - components can now import themselves directly:

```svelte
<!--- file: App.svelte --->
<script>
	import Self from './App.svelte'
	export let count;
</script>

{#if count > 0}
	<p>counting down... {count}</p>
	<Self count={count - 1} />
{:else}
	<p>lift-off!</p>
{/if}
```