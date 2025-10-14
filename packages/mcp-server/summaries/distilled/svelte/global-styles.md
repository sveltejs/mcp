# Global Styles

## `:global(...)` modifier

Apply styles to a single selector globally:

```svelte
<style>
	:global(body) {
		/* applies to <body> */
		margin: 0;
	}

	div :global(strong) {
		/* applies to all <strong> elements, in any component,
		   that are inside <div> elements belonging
		   to this component */
		color: goldenrod;
	}

	p:global(.big.red) {
		/* applies to all <p> elements belonging to this component
		   with `class="big red"`, even if it is applied
		   programmatically (for example by a library) */
	}
</style>
```

**Global keyframes:** Prepend with `-global-`, which gets removed at compile time:

```svelte
<style>
	@keyframes -global-my-animation-name {
		/* code goes here */
	}
</style>
```

## `:global {...}` block

Apply styles to multiple selectors globally:

```svelte
<style>
	:global {
		/* applies to every <div> in your application */
		div { ... }

		/* applies to every <p> in your application */
		p { ... }
	}

	.a :global {
		/* applies to every `.b .c .d` element, in any component,
		   that is inside an `.a` element in this component */
		.b .c .d {...}
	}
</style>
```