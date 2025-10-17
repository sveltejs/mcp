# `<svelte:body>`

Adds event listeners and actions to `document.body`.

**Syntax:**
```svelte
<svelte:body onevent={handler} />
```

**Usage:**
```svelte
<svelte:body onmouseenter={handleMouseenter} onmouseleave={handleMouseleave} use:someAction />
```

**Key points:**
- Use for events that don't fire on `window` (e.g., `mouseenter`, `mouseleave`)
- Supports [actions](use)
- Must be at top level of component (not inside blocks or elements)