# Accessibility

SvelteKit provides accessible defaults. You're responsible for ensuring your application code is accessible.

## Route Announcements

SvelteKit injects a [live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) that announces page changes during client-side navigation by reading the `<title>` element.

**Every page needs a unique, descriptive title:**

```svelte
<!--- file: src/routes/+page.svelte --->
<svelte:head>
	<title>Todo List</title>
</svelte:head>
```

## Focus Management

After each navigation and enhanced form submission, SvelteKit focuses `<body>` (or an element with `autofocus` if present).

**Customize focus with `afterNavigate`:**

```js
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
	/** @type {HTMLElement | null} */
	const to_focus = document.querySelector('.focus-me');
	to_focus?.focus();
});
```

**`goto` with `keepFocus` option:** Preserves current focus instead of resetting. Ensure the focused element still exists after navigation.

## Lang Attribute

Default is English. Update `src/app.html` for other languages:

```html
/// file: src/app.html
<html lang="de">
```

**For multiple languages, use a placeholder and `handle` hook:**

```html
/// file: src/app.html
<html lang="%lang%">
```

```js
/// file: src/hooks.server.js
/**
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
function get_lang(event) {
	return 'en';
}
// ---cut---
/** @type {import('@sveltejs/kit').Handle} */
export function handle({ event, resolve }) {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', get_lang(event))
	});
}
```

## Further Reading

- [MDN Web Docs: Accessibility](https://developer.mozilla.org/en-US/docs/Learn/Accessibility)
- [The A11y Project](https://www.a11yproject.com/)
- [How to Meet WCAG](https://www.w3.org/WAI/WCAG21/quickref/)