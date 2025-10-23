# {@html} Tag

Inject raw HTML into components:

```svelte
<article>
	{@html content}
</article>
```

**Security:** Escape or control all values to prevent XSS attacks. Never render unsanitized content.

**Limitations:**
- Expression must be valid standalone HTML (can't split tags)
- Does not compile Svelte code

## Styling

`{@html}` content is invisible to scoped styles. Use `:global` modifier:

```svelte
<style>
	article :global {
		a { color: hotpink }
		img { width: 100% }
	}
</style>
```