# Classes

## `class` Attribute

### Primitive values
```svelte
<div class={large ? 'large' : 'small'}>...</div>
```

**Note:** Falsy values are stringified (`class="false"`), except `undefined`/`null` which omit the attribute.

### Objects (Svelte 5.16+)
Truthy keys are added as classes:

```svelte
<script>
	let { cool } = $props();
</script>

<!-- results in `class="cool"` if `cool` is truthy,
     `class="lame"` otherwise -->
<div class={{ cool, lame: !cool }}>...</div>
```

### Arrays (Svelte 5.16+)
Truthy values are combined:

```svelte
<!-- if `faded` and `large` are both truthy, results in
     `class="saturate-0 opacity-50 scale-200"` -->
<div class={[faded && 'saturate-0 opacity-50', large && 'scale-200']}>...</div>
```

Arrays can contain nested arrays/objects (flattened via [clsx](https://github.com/lukeed/clsx)). Useful for combining local classes with props:

```svelte
<!--- file: Button.svelte --->
<script>
	let props = $props();
</script>

<button {...props} class={['cool-button', props.class]}>
	{@render props.children?.()}
</button>
```

```svelte
<!--- file: App.svelte --->
<script>
	import Button from './Button.svelte';
	let useTailwind = $state(false);
</script>

<Button
	onclick={() => useTailwind = true}
	class={{ 'bg-blue-700 sm:w-1/2': useTailwind }}
>
	Accept the inevitability of Tailwind
</Button>
```

### TypeScript (Svelte 5.19+)
Use `ClassValue` type for component props:

```svelte
<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	const props: { class: ClassValue } = $props();
</script>

<div class={['original', props.class]}>...</div>
```

## `class:` Directive (Legacy)

Conditional classes (pre-5.16 approach):

```svelte
<!-- These are equivalent -->
<div class={{ cool, lame: !cool }}>...</div>
<div class:cool={cool} class:lame={!cool}>...</div>
```

Shorthand when name matches value:

```svelte
<div class:cool class:lame={!cool}>...</div>
```

**Note:** Prefer `class` attribute over `class:` directive (more powerful and composable).