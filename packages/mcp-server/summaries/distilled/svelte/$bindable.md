# Component Bindings

Props normally flow parent → child. With `$bindable`, data can also flow child → parent, allowing children to mutate parent state.

> **Note:** Mutating normal props triggers a warning. Use `$bindable` to explicitly allow mutation.

## Basic Usage

Mark a prop as bindable with `$bindable()`:

```svelte
/// file: FancyInput.svelte
<script>
	let { value = $bindable(), ...props } = $props();
</script>

<input bind:value={value} {...props} />

<style>
	input {
		font-family: 'Comic Sans MS';
		color: deeppink;
	}
</style>
```

Parent uses `bind:` directive to create two-way binding:

```svelte
/// file: App.svelte
<script>
	import FancyInput from './FancyInput.svelte';

	let message = $state('hello');
</script>

<FancyInput bind:value={message} />
<p>{message}</p>
```

## Fallback Values

Parents can pass normal props without `bind:`. Provide a fallback for when no prop is passed:

```js
/// file: FancyInput.svelte
let { value = $bindable('fallback'), ...props } = $props();
```

**Best Practice:** Use sparingly — one-way data flow is easier to understand.