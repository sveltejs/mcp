# {@const}

Defines a local constant within a block.

```svelte
{#each boxes as box}
	{@const area = box.width * box.height}
	{box.width} * {box.height} = {area}
{/each}
```

**Restriction:** Only allowed as immediate child of `{#if}`, `{#each}`, `{#snippet}`, `<Component />`, or `<svelte:boundary>`.