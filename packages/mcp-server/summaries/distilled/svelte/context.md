# Context

Context allows components to access values from parent components without prop-drilling.

## Basic Usage

Parent sets context with `setContext(key, value)`:

```svelte
<!--- file: Parent.svelte --->
<script>
	import { setContext } from 'svelte';

	setContext('my-context', 'hello from Parent.svelte');
</script>
```

Child retrieves with `getContext`:

```svelte
<!--- file: Child.svelte --->
<script>
	import { getContext } from 'svelte';

	const message = getContext('my-context');
</script>

<h1>{message}, inside Child.svelte</h1>
```

Key and value can be any JavaScript value.

**Available functions:** `setContext`, `getContext`, `hasContext`, `getAllContexts`

## Context with Reactive State

Store reactive state in context:

```svelte
<script>
	import { setContext } from 'svelte';
	import Child from './Child.svelte';

	let counter = $state({
		count: 0
	});

	setContext('counter', counter);
</script>

<button onclick={() => counter.count += 1}>
	increment
</button>

<Child />
<Child />
<Child />
```

**Gotcha:** Mutate properties, don't reassign:

```svelte
<!-- ❌ Wrong - breaks the link -->
<button onclick={() => counter = { count: 0 }}>
	reset
</button>

<!-- ✅ Correct -->
<button onclick={() => counter.count = 0}>
	reset
</button>
```

## Type-Safe Context Pattern

Wrap context calls in helper functions:

```js
/// file: context.js
import { getContext, setContext } from 'svelte';

const key = {};

/** @param {User} user */
export function setUserContext(user) {
	setContext(key, user);
}

export function getUserContext() {
	return /** @type {User} */ (getContext(key));
}
```

## Context vs Global State

Global state modules work but have SSR risks:

```js
/// file: state.svelte.js
export const myGlobalState = $state({
	user: {
		// ...
	}
});
```

**Problem:** Mutating during SSR can leak data between requests. Context is request-scoped and solves this.