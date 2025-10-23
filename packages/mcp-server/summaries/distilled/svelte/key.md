# {#key} Block

**Syntax:**
```svelte
{#key expression}...{/key}
```

Destroys and recreates contents when expression changes.

**Reinstantiate components:**
```svelte
{#key value}
	<Component />
{/key}
```

**Replay transitions on value change:**
```svelte
{#key value}
	<div transition:fade>{value}</div>
{/key}
```