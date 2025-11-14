# TypeScript Patterns

## Basic Setup

### Component with Types

```svelte
<script lang="ts">
  interface Props {
    name: string;
    age: number;
    email?: string;
  }
  
  let { name, age, email }: Props = $props();
</script>
```

### Inline Types

For simple components:

```svelte
<script lang="ts">
  let { name, age }: { name: string; age: number } = $props();
</script>
```

## Typing $state

### Basic State

```svelte
<script lang="ts">
  let count: number = $state(0);
  let name: string = $state('Alice');
  let user: User | null = $state(null);
</script>
```

### State with Undefined

```svelte
<script lang="ts">
  // Will be set later
  let data = $state<Data | undefined>();
  
  $effect(() => {
    fetchData().then(d => data = d);
  });
</script>
```

### Arrays and Objects

```svelte
<script lang="ts">
  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }
  
  let todos = $state<Todo[]>([]);
  let user = $state<User>({ name: '', email: '' });
</script>
```

### Class State

```svelte
<script lang="ts">
  class Counter {
    // Will be initialized in constructor
    count = $state() as number;
    
    constructor(initial: number) {
      this.count = initial;
    }
    
    increment() {
      this.count++;
    }
  }
</script>
```

## Typing $derived

```svelte
<script lang="ts">
  let count = $state(0);
  
  // Type is inferred
  let doubled = $derived(count * 2);
  
  // Explicit type
  let message: string = $derived(`Count is ${count}`);
  
  // Complex derivation
  let summary = $derived.by((): Summary => {
    return {
      count,
      doubled: count * 2,
      status: count > 10 ? 'high' : 'low'
    };
  });
</script>
```

## Typing $props

### Basic Props Interface

```svelte
<script lang="ts">
  interface Props {
    // Required props
    id: number;
    name: string;
    
    // Optional props
    email?: string;
    age?: number;
    
    // Props with defaults (optional)
    role?: 'admin' | 'user';
    active?: boolean;
    
    // Functions
    onClick?: (event: MouseEvent) => void;
    onSubmit: (data: FormData) => void;
    
    // Snippets
    children?: Snippet;
    header?: Snippet;
    row?: Snippet<[Item]>;
  }
  
  let {
    id,
    name,
    email,
    age,
    role = 'user',
    active = true,
    onClick,
    onSubmit,
    children,
    header,
    row
  }: Props = $props();
</script>
```

### Generic Props

```svelte
<script lang="ts" generics="T extends { id: number }">
  interface Props {
    items: T[];
    onSelect: (item: T) => void;
    renderItem?: Snippet<[T]>;
  }
  
  let { items, onSelect, renderItem }: Props = $props();
</script>

{#each items as item (item.id)}
  <button onclick={() => onSelect(item)}>
    {#if renderItem}
      {@render renderItem(item)}
    {:else}
      {item.id}
    {/if}
  </button>
{/each}
```

### Multiple Generics

```svelte
<script lang="ts" generics="T, U extends keyof T">
  interface Props {
    data: T;
    key: U;
  }
  
  let { data, key }: Props = $props();
</script>

<p>{data[key]}</p>
```

### Generic with Constraints

```svelte
<script lang="ts" generics="T extends Record<string, any>">
  interface Props {
    data: T;
    keys: Array<keyof T>;
  }
  
  let { data, keys }: Props = $props();
</script>

{#each keys as key}
  <div>{key}: {data[key]}</div>
{/each}
```

## Typing Snippets

### Basic Snippet

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
```

### Snippet with Parameters

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface User {
    id: number;
    name: string;
  }
  
  let { row }: { row: Snippet<[User]> } = $props();
  let users: User[] = [/* ... */];
</script>

{#each users as user}
  {@render row(user)}
{/each}
```

### Multiple Parameters

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let {
    cell
  }: {
    cell: Snippet<[number, number, string]>  // row, col, value
  } = $props();
</script>

{@render cell(0, 0, 'A1')}
```

### Optional Snippets

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  let {
    header,
    footer
  }: {
    header?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

{@render header?.()}
<main>Content</main>
{@render footer?.()}
```

## Typing $bindable

```svelte
<script lang="ts">
  let {
    value = $bindable(''),
    count = $bindable(0)
  }: {
    value?: string;
    count?: number;
  } = $props();
</script>
```

## Component Types

### Component Type

```svelte
<script lang="ts">
  import type { Component } from 'svelte';
  import ComponentA from './A.svelte';
  import ComponentB from './B.svelte';
  
  // Type for dynamic component
  let Current: Component<{ name: string }> = $state(ComponentA);
</script>

<Current name="test" />
```

### ComponentProps Type

Extract props from a component:

```svelte
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import MyComponent from './MyComponent.svelte';
  
  type MyProps = ComponentProps<typeof MyComponent>;
  
  const props: MyProps = {
    name: 'Alice',
    age: 30
  };
</script>

<MyComponent {...props} />
```

### Component Instance Type

```svelte
<script lang="ts">
  import MyComponent from './MyComponent.svelte';
  
  let instance: MyComponent;
</script>

<MyComponent bind:this={instance} />
```

## Event Handler Types

### DOM Events

```svelte
<script lang="ts">
  function handleClick(event: MouseEvent) {
    const button = event.currentTarget as HTMLButtonElement;
    console.log(button.textContent);
  }
  
  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log(input.value);
  }
  
  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
  }
</script>

<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<form onsubmit={handleSubmit}>...</form>
```

### Custom Event Callbacks

```svelte
<script lang="ts">
  interface Events {
    click?: (event: MouseEvent) => void;
    submit?: (data: FormData) => void;
    change?: (value: string) => void;
  }
  
  let { click, submit, change }: Events = $props();
</script>
```

## Typing with HTML Elements

### Element References

```svelte
<script lang="ts">
  let div: HTMLDivElement;
  let input: HTMLInputElement;
  let canvas: HTMLCanvasElement;
  
  $effect(() => {
    if (div) {
      console.log(div.offsetWidth);
    }
    
    if (canvas) {
      const ctx = canvas.getContext('2d');
      // ctx is CanvasRenderingContext2D | null
    }
  });
</script>

<div bind:this={div}>Content</div>
<input bind:this={input} />
<canvas bind:this={canvas}></canvas>
```

### HTML Attributes

Extend HTML attributes for custom elements:

```ts
// app.d.ts
import type { HTMLAttributes } from 'svelte/elements';

declare module 'svelte/elements' {
  export interface SvelteHTMLElements {
    'custom-element': HTMLAttributes<HTMLElement> & {
      'custom-prop'?: string;
    };
  }
}
```

## Typing Actions

```svelte
<script lang="ts">
  import type { Action } from 'svelte/action';
  
  interface ClickOutsideParams {
    enabled: boolean;
    callback: () => void;
  }
  
  const clickOutside: Action<HTMLElement, ClickOutsideParams> = (
    node,
    params
  ) => {
    function handleClick(event: MouseEvent) {
      if (params.enabled && !node.contains(event.target as Node)) {
        params.callback();
      }
    }
    
    $effect(() => {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    });
  };
</script>

<div use:clickOutside={{ enabled: true, callback: () => {} }}>
  Content
</div>
```

## Wrapper Components

### Extending HTML Element Props

```svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary';
  }
  
  let { variant = 'primary', children, ...rest }: Props = $props();
</script>

<button class={variant} {...rest}>
  {@render children?.()}
</button>
```

### Generic Wrapper

```svelte
<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements';
  
  let {
    as = 'div',
    children,
    ...rest
  }: {
    as?: keyof SvelteHTMLElements;
    children?: Snippet;
    [key: string]: any;
  } = $props();
</script>

<svelte:element this={as} {...rest}>
  {@render children?.()}
</svelte:element>
```

## Store Types (Legacy)

If still using stores:

```svelte
<script lang="ts">
  import { writable, type Writable } from 'svelte/store';
  
  interface User {
    name: string;
    email: string;
  }
  
  const user: Writable<User | null> = writable(null);
</script>

{#if $user}
  <p>{$user.name}</p>
{/if}
```

## Advanced Patterns

### Discriminated Unions

```svelte
<script lang="ts">
  type State =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: Data }
    | { status: 'error'; error: Error };
  
  let state = $state<State>({ status: 'idle' });
</script>

{#if state.status === 'loading'}
  <p>Loading...</p>
{:else if state.status === 'success'}
  <DataView data={state.data} />
{:else if state.status === 'error'}
  <p>Error: {state.error.message}</p>
{/if}
```

### Conditional Props

```svelte
<script lang="ts">
  type Props =
    | { mode: 'view'; data: Data }
    | { mode: 'edit'; data: Data; onSave: (data: Data) => void };
  
  let props = $props() as Props;
</script>

{#if props.mode === 'edit'}
  <button onclick={() => props.onSave(props.data)}>Save</button>
{/if}
```

### Type Guards

```svelte
<script lang="ts">
  function isUser(value: unknown): value is User {
    return (
      typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      'email' in value
    );
  }
  
  let data: unknown = $state(null);
  
  $effect(() => {
    if (isUser(data)) {
      // data is User here
      console.log(data.name);
    }
  });
</script>
```

## tsconfig.json Settings

Recommended settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Common Type Issues

### Issue: Type not inferred in $derived

```svelte
<script lang="ts">
  let items = $state<Item[]>([]);
  
  // Type not inferred automatically
  let first = $derived.by(() => {
    return items[0]; // May need explicit return type
  });
  
  // Better: Add explicit type
  let first = $derived.by((): Item | undefined => {
    return items[0];
  });
</script>
```

### Issue: Snippet parameter types

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  // Must specify tuple type for parameters
  let { row }: { row: Snippet<[Item]> } = $props();
  
  // Not: Snippet<Item> (incorrect)
</script>
```

### Issue: Generic component props

```svelte
<script lang="ts" generics="T">
  // Must constrain generic if accessing properties
  interface Props {
    items: T[]; // Works
    getKey: (item: T) => string; // Works
  }
  
  // If you need to access item.id:
  // generics="T extends { id: string }"
</script>
```
