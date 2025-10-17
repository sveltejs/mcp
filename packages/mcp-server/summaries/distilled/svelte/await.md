# {#await} Block

Handles the three states of a Promise: pending, fulfilled, rejected.

## Syntax Variants

```svelte
{#await expression}...{:then name}...{:catch name}...{/await}
{#await expression}...{:then name}...{/await}
{#await expression then name}...{/await}
{#await expression catch name}...{/await}
```

## Full Example

```svelte
{#await promise}
	<!-- promise is pending -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise was fulfilled or not a Promise -->
	<p>The value is {value}</p>
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
```

## Gotchas

- **SSR**: Only pending branch renders on server
- **Non-Promise**: If expression isn't a Promise, only `:then` branch renders (including SSR)

## Shorthand Patterns

**Omit catch block:**
```svelte
{#await promise then value}
	<p>The value is {value}</p>
{/await}
```

**Omit then block (error only):**
```svelte
{#await promise catch error}
	<p>The error is {error}</p>
{/await}
```

## Lazy Component Loading

```svelte
{#await import('./Component.svelte') then { default: Component }}
	<Component />
{/await}
```