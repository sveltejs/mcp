# svelte/animate

## flip

Animates an element between start and end positions by translating x and y values. FLIP = First, Last, Invert, Play.

```js
import { flip } from 'svelte/animate';
```

```dts
function flip(
	node: Element,
	{
		from,
		to
	}: {
		from: DOMRect;
		to: DOMRect;
	},
	params?: FlipParams
): AnimationConfig;
```

## AnimationConfig

```dts
interface AnimationConfig {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}
```

## FlipParams

```dts
interface FlipParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: (t: number) => number;
}
```