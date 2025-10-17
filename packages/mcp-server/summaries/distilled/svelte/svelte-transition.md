# Svelte Transitions

## Import

```js
import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
```

## Built-in Transitions

### blur
Animates blur filter + opacity.

```dts
function blur(
	node: Element,
	{ delay, duration, easing, amount, opacity }?: BlurParams
): TransitionConfig;
```

### fade
Animates opacity from 0 to current (in) or current to 0 (out).

```dts
function fade(
	node: Element,
	{ delay, duration, easing }?: FadeParams
): TransitionConfig;
```

### fly
Animates x/y position + opacity. `in` animates from provided values to defaults, `out` animates from defaults to provided values.

```dts
function fly(
	node: Element,
	{ delay, duration, easing, x, y, opacity }?: FlyParams
): TransitionConfig;
```

### scale
Animates scale + opacity. `in` animates from provided values to defaults, `out` animates from defaults to provided values.

```dts
function scale(
	node: Element,
	{ delay, duration, easing, start, opacity }?: ScaleParams
): TransitionConfig;
```

### slide
Slides element in/out.

```dts
function slide(
	node: Element,
	{ delay, duration, easing, axis }?: SlideParams
): TransitionConfig;
```

### draw
Animates SVG stroke (snake-in-tube effect). Works with elements having `getTotalLength()` like `<path>` and `<polyline>`.

```dts
function draw(
	node: SVGElement & { getTotalLength(): number },
	{ delay, speed, duration, easing }?: DrawParams
): TransitionConfig;
```

### crossfade
Creates `send`/`receive` transition pair. Sent element transforms to received element's position and fades out. If no counterpart, uses `fallback` transition.

```dts
function crossfade({
	fallback,
	...defaults
}: CrossfadeParams & {
	fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
}): [send, receive];
```

## Type Definitions

```dts
type EasingFunction = (t: number) => number;

interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	amount?: number | string;
	opacity?: number;
}

interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	start?: number;
	opacity?: number;
}

interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}
```