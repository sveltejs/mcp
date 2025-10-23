# Runes

Runes are symbols that control the Svelte compiler in `.svelte` and `.svelte.js`/`.svelte.ts` files. They are keywords, not functions.

## Syntax

Runes have a `$` prefix and look like functions:

```js
let message = $state('hello');
```

## Key Characteristics

- **No import needed** — they are globals
- **Not values** — cannot be assigned to variables or passed as arguments
- **Position-specific** — only valid in certain positions (compiler enforces this)