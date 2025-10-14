# svelte/motion

```js
import { Spring, Tween, prefersReducedMotion, spring, tweened } from 'svelte/motion';
```

## Spring

**Available since 5.8.0**

Wrapper for spring-like animated values. Changes to `spring.target` cause `spring.current` to move towards it based on `stiffness` and `damping`.

```svelte
<script>
	import { Spring } from 'svelte/motion';

	const spring = new Spring(0);
</script>

<input type="range" bind:value={spring.target} />
<input type="range" bind:value={spring.current} disabled />
```

### Constructor
```dts
constructor(value: T, options?: SpringOpts);
```

### Static Method
```dts
Spring.of<U>(fn: () => U, options?: SpringOpts): Spring<U>;
```
Creates spring bound to `fn` return value. Must be called inside effect root (e.g., component initialization).

```svelte
<script>
	import { Spring } from 'svelte/motion';

	let { number } = $props();

	const spring = Spring.of(() => number);
</script>
```

### Methods
```dts
set(value: T, options?: SpringUpdateOpts): Promise<void>;
```
Sets `spring.target` to `value`, returns Promise resolving when `spring.current` catches up.
- `options.instant`: immediately match target
- `options.preserveMomentum`: continue trajectory for specified milliseconds (useful for fling gestures)

### Properties
- `target: T` - end value
- `current: T` (getter) - current value
- `stiffness: number`
- `damping: number`
- `precision: number`

## Tween

**Available since 5.8.0**

Wrapper for smoothly tweened values. Changes to `tween.target` cause `tween.current` to move towards it based on `delay`, `duration`, and `easing`.

```svelte
<script>
	import { Tween } from 'svelte/motion';

	const tween = new Tween(0);
</script>

<input type="range" bind:value={tween.target} />
<input type="range" bind:value={tween.current} disabled />
```

### Constructor
```dts
constructor(value: T, options?: TweenedOptions<T>);
```

### Static Method
```dts
Tween.of<U>(fn: () => U, options?: TweenedOptions<U>): Tween<U>;
```
Creates tween bound to `fn` return value. Must be called inside effect root.

```svelte
<script>
	import { Tween } from 'svelte/motion';

	let { number } = $props();

	const tween = Tween.of(() => number);
</script>
```

### Methods
```dts
set(value: T, options?: TweenedOptions<T>): Promise<void>;
```
Sets `tween.target`, returns Promise. Options override defaults.

### Properties
- `target: T` (getter/setter)
- `current: T` (getter)

## prefersReducedMotion

**Available since 5.7.0**

Media query matching user's [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) preference.

```svelte
<script>
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';

	let visible = $state(false);
</script>

<button onclick={() => visible = !visible}>
	toggle
</button>

{#if visible}
	<p transition:fly={{ y: prefersReducedMotion.current ? 0 : 200 }}>
		flies in, unless the user prefers reduced motion
	</p>
{/if}
```

## spring (deprecated)

**Use `Spring` instead**

```dts
function spring<T = any>(value?: T, opts?: SpringOpts): Spring<T>;
```

## tweened (deprecated)

**Use `Tween` instead**

```dts
function tweened<T>(value?: T, defaults?: TweenedOptions<T>): Tweened<T>;
```