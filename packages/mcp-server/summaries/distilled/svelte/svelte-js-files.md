# `.svelte.js` and `.svelte.ts` files

Svelte operates on `.svelte.js` and `.svelte.ts` files in addition to `.svelte` files.

**Key points:**
- Behave like regular `.js`/`.ts` modules but can use runes
- Useful for reusable reactive logic or sharing reactive state
- **Gotcha:** Cannot export reassigned state