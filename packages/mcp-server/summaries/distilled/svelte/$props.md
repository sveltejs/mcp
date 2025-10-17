# Props

Pass props to components like attributes:

```svelte
<!--- file: App.svelte --->
<script>
	import MyComponent from './MyComponent.svelte';
</script>

<MyComponent adjective="cool" />
```

Receive props with `$props` rune (destructuring is common):

```svelte
<!--- file: MyComponent.svelte --->
<script>
	let { adjective } = $props();
</script>

<p>this component is {adjective}</p>
```

## Fallback values

Use destructuring defaults for fallback values:

```js
let { adjective = 'happy' } = $props();
```

> **Note:** Fallback values are not turned into reactive state proxies.

## Renaming props

Rename props for invalid identifiers or keywords:

```js
let { super: trouper = 'lights are gonna find me' } = $props();
```

## Rest props

Get remaining props with rest property:

```js
let { a, b, c, ...others } = $props();
```

## Updating props

Props update when parent changes. Child can temporarily **reassign** props but should **not mutate** them unless they are `$bindable`.

**Reassignment works** (temporary override):

```svelte
<!--- file: Child.svelte --->
<script>
	let { count } = $props();
</script>

<button onclick={() => (count += 1)}>
	clicks (child): {count}
</button>
```

**Mutating regular objects has no effect:**

```svelte
<button onclick={() => {
	// has no effect
	object.count += 1
}}>
	clicks: {object.count}
</button>
```

**Mutating reactive state proxies causes `ownership_invalid_mutation` warning** — don't mutate objects you don't own.

**Mutating fallback values has no effect** (not reactive).

**Solution:** Use callback props or `$bindable` to share state between parent and child.

## Type safety

TypeScript:

```svelte
<script lang="ts">
	let { adjective }: { adjective: string } = $props();
</script>
```

JSDoc:

```svelte
<script>
	/** @type {{ adjective: string }} */
	let { adjective } = $props();
</script>
```

With interface:

```svelte
<script lang="ts">
	interface Props {
		adjective: string;
	}

	let { adjective }: Props = $props();
</script>
```

> **Note:** Native DOM element interfaces available in `svelte/elements` module.

## `$props.id()`

Generates unique ID per component instance (consistent during SSR hydration). Useful for linking elements:

```svelte
<script>
	const uid = $props.id();
</script>

<form>
	<label for="{uid}-firstname">First Name: </label>
	<input id="{uid}-firstname" type="text" />

	<label for="{uid}-lastname">Last Name: </label>
	<input id="{uid}-lastname" type="text" />
</form>
```