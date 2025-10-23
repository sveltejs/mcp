# Conditional Rendering

## Syntax

```svelte
{#if expression}...{/if}
{#if expression}...{:else if expression}...{/if}
{#if expression}...{:else}...{/if}
```

## Usage

Basic conditional:

```svelte
{#if answer === 42}
	<p>what was the question?</p>
{/if}
```

Multiple conditions with `{:else if}` and optional `{:else}`:

```svelte
{#if porridge.temperature > 100}
	<p>too hot!</p>
{:else if 80 > porridge.temperature}
	<p>too cold!</p>
{:else}
	<p>just right!</p>
{/if}
```

**Note:** Blocks can wrap elements or text within elements.