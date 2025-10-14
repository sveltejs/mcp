# Imperative Component API

Root components are created imperatively. Client components mount to elements; server components render to HTML strings.

## `mount`

Instantiates and mounts a component to a target element:

```js
// @errors: 2322
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

**Key differences from Svelte 4:**
- Effects (including `onMount` and actions) don't run during `mount`
- Use `flushSync()` to force pending effects to run (e.g., in tests)

Can mount multiple components per page or dynamically within your app.

## `unmount`

Unmounts a component created with `mount` or `hydrate`:

```js
import { mount, unmount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.body });

// later
unmount(app, { outro: true });
```

- `options.outro: true` plays transitions before removal
- Returns `Promise` that resolves after transitions (if `outro: true`) or immediately

## `render`

Server-only (requires `server` compile option). Returns `body` and `head` HTML strings:

```js
// @errors: 2724 2305 2307
import { render } from 'svelte/server';
import App from './App.svelte';

const result = render(App, {
	props: { some: 'property' }
});
result.body; // HTML for somewhere in this <body> tag
result.head; // HTML for somewhere in this <head> tag
```

## `hydrate`

Like `mount`, but reuses SSR-rendered HTML and makes it interactive:

```js
// @errors: 2322
import { hydrate } from 'svelte';
import App from './App.svelte';

const app = hydrate(App, {
	target: document.querySelector('#app'),
	props: { some: 'property' }
});
```

Effects don't run during `hydrate` — use `flushSync()` immediately after if needed.