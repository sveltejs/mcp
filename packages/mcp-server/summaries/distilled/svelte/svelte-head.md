# `<svelte:head>`

Inserts elements into `document.head`. During SSR, head content is exposed separately from body content.

**Restrictions:**
- Must be at top level of component
- Cannot be inside blocks or elements

```svelte
<svelte:head>
	<title>Hello world!</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>
```