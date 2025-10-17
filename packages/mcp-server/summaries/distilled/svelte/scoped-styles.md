# Styles

Component `<style>` elements are **scoped by default** via a hash-based class (e.g. `svelte-123xyz`).

```svelte
<style>
	p {
		/* this will only affect <p> elements in this component */
		color: burlywood;
	}
</style>
```

## Specificity

Scoped selectors get **+0-1-0 specificity** from the scoping class. Component `p` selector beats global `p` selector, even if global loads later.

Multiple scoping classes use `:where(.svelte-xyz123)` after the first to avoid further specificity increases.

## Scoped keyframes

`@keyframes` names are hashed per-component. `animation` rules automatically adjusted.

```svelte
<style>
	.bouncy {
		animation: bounce 10s;
	}

	/* these keyframes are only accessible inside this component */
	@keyframes bounce {
		/* ... */
	}
</style>
```