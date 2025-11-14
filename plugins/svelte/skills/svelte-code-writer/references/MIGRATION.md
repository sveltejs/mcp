# Migration Guide: Svelte 4 → Svelte 5

## Overview

Svelte 5 is largely backward compatible. You can mix Svelte 4 and 5 syntax, and migrate incrementally.

## Migration Strategy

1. **Update dependencies** in package.json
2. **Run migration script**: `npx sv migrate svelte-5`
3. **Fix manual migrations** (see below)
4. **Test thoroughly**
5. **Iterate component by component**

## Automatic Migrations

The migration script handles:
- `let` → `$state()`
- `$:` derivations → `$derived()`
- `$:` effects → `$effect()` or `run()`
- `export let` → `$props()`
- `on:event` → `onevent` (for DOM elements)
- `<slot>` → `{@render children()}`
- Slot usage → snippets

## Manual Migrations Required

### 1. Component Events (createEventDispatcher)

**Before:**
```svelte
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleClick() {
    dispatch('message', { text: 'Hello' });
  }
</script>

<button on:click={handleClick}>Send</button>
```

**After:**
```svelte
<script>
  let { onmessage } = $props();
  
  function handleClick() {
    onmessage?.({ text: 'Hello' });
  }
</script>

<button onclick={handleClick}>Send</button>
```

**Parent usage before:**
```svelte
<Child on:message={handleMessage} />
```

**Parent usage after:**
```svelte
<Child onmessage={handleMessage} />
```

### 2. beforeUpdate/afterUpdate

**Before:**
```svelte
<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
  
  beforeUpdate(() => {
    console.log('before update');
  });
  
  afterUpdate(() => {
    console.log('after update');
  });
</script>
```

**After:**
```svelte
<script>
  import { tick } from 'svelte';
  
  // beforeUpdate → $effect.pre
  $effect.pre(() => {
    console.log('before update');
  });
  
  // afterUpdate → $effect + tick
  $effect(() => {
    tick().then(() => {
      console.log('after update');
    });
  });
</script>
```

### 3. Component Instantiation

**Before:**
```js
import App from './App.svelte';

const app = new App({
  target: document.getElementById('app'),
  props: { name: 'world' }
});

app.$set({ name: 'everybody' });
app.$on('event', callback);
app.$destroy();
```

**After:**
```js
import { mount, unmount } from 'svelte';
import App from './App.svelte';

const props = $state({ name: 'world' });
const app = mount(App, {
  target: document.getElementById('app'),
  props
});

// Instead of $set:
props.name = 'everybody';

// Instead of $on:
const app = mount(App, {
  target: document.getElementById('app'),
  props,
  events: { event: callback }
});

// Instead of $destroy:
unmount(app);
```

### 4. Server-Side Rendering

**Before:**
```js
import App from './App.svelte';

const { html, css, head } = App.render({ name: 'world' });
```

**After:**
```js
import { render } from 'svelte/server';
import App from './App.svelte';

const { html, head } = render(App, {
  props: { name: 'world' }
});
```

Note: CSS is no longer returned by default. Set compiler option `css: 'injected'` if needed.

### 5. Stores in Components

If using stores, they still work but consider migrating to runes:

**Before:**
```svelte
<script>
  import { writable } from 'svelte/store';
  
  const count = writable(0);
  
  function increment() {
    count.update(n => n + 1);
  }
</script>

<button on:click={increment}>
  {$count}
</button>
```

**After (using runes):**
```svelte
<script>
  let count = $state(0);
  
  function increment() {
    count++;
  }
</script>

<button onclick={increment}>
  {count}
</button>
```

## Common Migration Patterns

### Pattern 1: Reactive Statements

**Before:**
```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
  $: {
    console.log(`count is ${count}`);
  }
  $: if (count > 10) {
    alert('Too high!');
  }
</script>
```

**After:**
```svelte
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  
  $effect(() => {
    console.log(`count is ${count}`);
  });
  
  $effect(() => {
    if (count > 10) {
      alert('Too high!');
    }
  });
</script>
```

### Pattern 2: Props with Defaults

**Before:**
```svelte
<script>
  export let name = 'world';
  export let count;
</script>
```

**After:**
```svelte
<script>
  let { name = 'world', count } = $props();
</script>
```

### Pattern 3: Slot Props

**Before:**
```svelte
<!-- Child.svelte -->
<slot user={{ name: 'Alice', age: 30 }} />

<!-- Parent.svelte -->
<Child let:user>
  {user.name} is {user.age}
</Child>
```

**After:**
```svelte
<!-- Child.svelte -->
<script>
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet<[User]> } = $props();
</script>

{@render children({ name: 'Alice', age: 30 })}

<!-- Parent.svelte -->
<Child>
  {#snippet children(user)}
    {user.name} is {user.age}
  {/snippet}
</Child>
```

### Pattern 4: Named Slots

**Before:**
```svelte
<!-- Child.svelte -->
<header><slot name="header" /></header>
<main><slot /></main>
<footer><slot name="footer" /></footer>

<!-- Parent.svelte -->
<Child>
  <h1 slot="header">Title</h1>
  <p>Content</p>
  <p slot="footer">Footer</p>
</Child>
```

**After:**
```svelte
<!-- Child.svelte -->
<script>
  import type { Snippet } from 'svelte';
  let { header, children, footer }: {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<header>{@render header?.()}</header>
<main>{@render children?.()}</main>
<footer>{@render footer?.()}</footer>

<!-- Parent.svelte -->
<Child>
  {#snippet header()}
    <h1>Title</h1>
  {/snippet}
  
  <p>Content</p>
  
  {#snippet footer()}
    <p>Footer</p>
  {/snippet}
</Child>
```

### Pattern 5: Event Forwarding

**Before:**
```svelte
<button on:click>Click me</button>
```

**After:**
```svelte
<script>
  let { onclick } = $props();
</script>

<button {onclick}>Click me</button>
```

### Pattern 6: Prop Spreading with Events

**Before:**
```svelte
<script>
  export let disabled = false;
</script>

<button {...$$restProps} on:click {disabled}>
  <slot />
</button>
```

**After:**
```svelte
<script>
  let { disabled = false, children, ...rest } = $props();
</script>

<button {disabled} {...rest}>
  {@render children?.()}
</button>
```

## The `run` Function

The migration script may create `run()` calls for `$:` statements it can't determine are safe to convert to `$effect`:

```svelte
<script>
  import { run } from 'svelte/legacy';
  
  run(() => {
    // Migrated $: statement
  });
</script>
```

**Action required:** Review each `run()` and convert to:
- `$derived()` if it's computing a value
- `$effect()` if it's a side effect
- Remove if no longer needed

## Compatibility Options

### Keep Svelte 4 Syntax Working

Use `compatibility.componentApi: 4` to keep `new Component()` working:

```js
// svelte.config.js
export default {
  compilerOptions: {
    compatibility: {
      componentApi: 4
    }
  }
};
```

This adds some overhead but helps during migration.

## Breaking Changes in Runes Mode

### 1. Bindings Need $bindable

**Before (Svelte 4):**
```svelte
<script>
  export let value;
</script>
```

All props were bindable in parent:
```svelte
<Child bind:value />
```

**After (Svelte 5):**
```svelte
<script>
  let { value = $bindable() } = $props();
</script>
```

Only explicitly bindable props can use `bind:`.

### 2. No Implicit Reactivity

**Before:**
```svelte
<script>
  let count = 0; // Implicitly reactive
</script>
```

**After:**
```svelte
<script>
  let count = $state(0); // Explicitly reactive
</script>
```

### 3. Component Type Changes

**Before:**
```ts
import type { SvelteComponent } from 'svelte';
import MyComponent from './MyComponent.svelte';

let instance: SvelteComponent;
let ComponentType: typeof SvelteComponent;
```

**After:**
```ts
import type { Component } from 'svelte';
import MyComponent from './MyComponent.svelte';

let instance: MyComponent;
let ComponentType: Component<{ prop: string }>;
```

## Testing Migration

After migrating, test:

1. **All user interactions** - clicks, forms, inputs
2. **Reactive updates** - ensure UI updates correctly
3. **Component communication** - props, events (callbacks)
4. **Lifecycle behavior** - mounting, updating, cleanup
5. **Conditional rendering** - `{#if}`, `{#each}`, `{#await}`

## Common Migration Issues

### Issue: Events not firing

**Problem:**
```svelte
<Child on:click={handler} />  <!-- Svelte 4 syntax -->
```

**Solution:**
```svelte
<Child onclick={handler} />    <!-- Svelte 5 syntax -->
```

### Issue: Slot not rendering

**Problem:**
```svelte
<Child>Content</Child>  <!-- Still using slot in Child -->
```

**Solution:** Update Child to use snippets:
```svelte
<script>
  let { children } = $props();
</script>
{@render children?.()}
```

### Issue: Derived value not updating

**Problem:**
```svelte
let doubled = count * 2;  <!-- Not reactive! -->
```

**Solution:**
```svelte
let doubled = $derived(count * 2);
```

### Issue: $set no longer exists

**Problem:**
```js
componentInstance.$set({ prop: 'value' });
```

**Solution:** Use reactive props:
```js
const props = $state({ prop: 'value' });
mount(Component, { props });
props.prop = 'new value';  // Updates component
```

## Incremental Migration Tips

1. **Start with leaf components** (no children)
2. **Migrate one component at a time**
3. **Test after each component**
4. **Use compatibility mode** during transition
5. **Update TypeScript types** as you go
6. **Document custom patterns** your team uses

## Resources

- Run `npx sv migrate svelte-5` for automated migration
- Check compiler warnings - they guide migration
- Review Svelte 5 docs: https://svelte.dev/docs
- Use VS Code extension for real-time feedback
