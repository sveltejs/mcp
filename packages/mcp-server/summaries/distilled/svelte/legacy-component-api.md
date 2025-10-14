# Legacy Component API (Svelte 3/4)

> **Note:** This does NOT apply to Svelte 5 components or legacy mode in Svelte 5 apps.

## Creating a Component

```ts
const component = new Component(options);
```

**Options:**

| option    | default     | description                                                                                          |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `target`  | **required**| `HTMLElement` or `ShadowRoot` to render to                                                           |
| `anchor`  | `null`      | Child of `target` to render before                                                                   |
| `props`   | `{}`        | Properties to supply to component                                                                    |
| `context` | `new Map()` | Root-level context key-value pairs                                                                   |
| `hydrate` | `false`     | Upgrade existing DOM instead of creating new (requires `hydratable: true` compile option)            |
| `intro`   | `false`     | Play transitions on initial render                                                                   |

```ts
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: { answer: 42 }
});
```

**Svelte 5:** Use [`mount`](svelte#mount) instead

## `$set`

```ts
component.$set(props);
```

Programmatically set props. Schedules update for next microtask (async).

```ts
component.$set({ answer: 42 });
```

**Svelte 5:** Use `$state` for props:
```js
let props = $state({ answer: 42 });
const component = mount(Component, { props });
props.answer = 24;
```

## `$on`

```ts
component.$on(ev, callback);
```

Listen to component events. Returns function to remove listener.

```ts
const off = component.$on('selected', (event) => {
	console.log(event.detail.selection);
});
off();
```

**Svelte 5:** Use callback props instead

## `$destroy`

```js
component.$destroy();
```

Remove component from DOM and trigger `onDestroy` handlers.

**Svelte 5:** Use [`unmount`](svelte#unmount) instead

## Component Props (accessors)

```js
component.prop;
component.prop = value;
```

With `accessors: true` compile option, get/set props directly. Setting causes **synchronous** update (unlike `$set`).

**Svelte 5:** Export properties to make them accessible

## Server-Side API

```js
const result = Component.render(...)
```

Returns object with `head`, `html`, `css` properties.

```js
require('svelte/register');
const App = require('./App.svelte').default;

const { head, html, css } = App.render(
	{ answer: 42 },
	{ context: new Map([['context-key', 'context-value']]) }
);
```

**Svelte 5:** Use [`render`](svelte-server#render) instead