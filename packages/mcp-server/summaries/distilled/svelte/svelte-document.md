# `<svelte:document>`

Add event listeners and actions to `document`. Bind to document properties.

## Syntax

```svelte
<svelte:document onevent={handler} />
```

```svelte
<svelte:document bind:prop={value} />
```

## Usage

- Handles events that fire on `document` but not `window` (e.g., `visibilitychange`)
- Supports [actions](use)
- **Must be at top level** (not inside blocks or elements)

```svelte
<svelte:document onvisibilitychange={handleVisibilityChange} use:someAction />
```

## Bindable Properties (readonly)

- `activeElement`
- `fullscreenElement`
- `pointerLockElement`
- `visibilityState`