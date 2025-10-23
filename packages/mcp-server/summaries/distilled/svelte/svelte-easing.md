# svelte/easing

Easing functions for animations. All functions take a number `t` (0-1) and return a number (0-1).

```js
import {
	backIn, backInOut, backOut,
	bounceIn, bounceInOut, bounceOut,
	circIn, circInOut, circOut,
	cubicIn, cubicInOut, cubicOut,
	elasticIn, elasticInOut, elasticOut,
	expoIn, expoInOut, expoOut,
	linear,
	quadIn, quadInOut, quadOut,
	quartIn, quartInOut, quartOut,
	quintIn, quintInOut, quintOut,
	sineIn, sineInOut, sineOut
} from 'svelte/easing';
```

**Signature:** `(t: number) => number`

**Available functions:**
- `linear` - No easing
- `quad`, `cubic`, `quart`, `quint` - Polynomial easing (power of 2, 3, 4, 5)
- `sine` - Sinusoidal easing
- `expo` - Exponential easing
- `circ` - Circular easing
- `back` - Overshooting easing
- `bounce` - Bouncing easing
- `elastic` - Elastic easing

Each (except `linear`) has `In`, `Out`, and `InOut` variants.