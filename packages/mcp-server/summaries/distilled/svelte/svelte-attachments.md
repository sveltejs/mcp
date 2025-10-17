# svelte/attachments

```js
import { createAttachmentKey, fromAction } from 'svelte/attachments';
```

## createAttachmentKey

Creates a symbol key for programmatic attachments (alternative to `{@attach ...}`). Useful for library authors.

```svelte
<script>
	import { createAttachmentKey } from 'svelte/attachments';

	const props = {
		class: 'cool',
		onclick: () => alert('clicked'),
		[createAttachmentKey()]: (node) => {
			node.textContent = 'attached!';
		}
	};
</script>

<button {...props}>click me</button>
```

```dts
function createAttachmentKey(): symbol;
```

## fromAction

Converts an action into an attachment with same behavior. Second argument must be a function that returns the action's argument.

```svelte
<!-- with an action -->
<div use:foo={bar}>...</div>

<!-- with an attachment -->
<div {@attach fromAction(foo, () => bar)}>...</div>
```

```dts
function fromAction<E extends EventTarget, T extends unknown>(
	action: Action<E, T> | ((element: E, arg: T) => void | ActionReturn<T>),
	fn: () => T
): Attachment<E>;

function fromAction<E extends EventTarget>(
	action: Action<E, void> | ((element: E) => void | ActionReturn<void>)
): Attachment<E>;
```

## Attachment

Function that runs when element mounts, optionally returns cleanup function. Used with `{@attach ...}` or via `createAttachmentKey`.

```dts
interface Attachment<T extends EventTarget = Element> {
	(element: T): void | (() => void);
}
```