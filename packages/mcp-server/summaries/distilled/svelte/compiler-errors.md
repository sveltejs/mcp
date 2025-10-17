# Svelte 5 Error Messages Reference

## Animation Directives

- **animation_duplicate**: Only one `animate:` directive per element
- **animation_invalid_placement**: `animate:` must be on the only child of a keyed `{#each}` block
- **animation_missing_key**: Did you forget to add a key to your each block?

## Attributes

- **attribute_contenteditable_dynamic**: `contenteditable` must be static when using two-way binding
- **attribute_contenteditable_missing**: `contenteditable` required for `textContent`, `innerHTML`, `innerText` bindings
- **attribute_duplicate**: Attributes must be unique
- **attribute_invalid_event_handler**: Event attributes must be JavaScript expressions, not strings
- **attribute_invalid_multiple**: `multiple` must be static on `<select>` with two-way binding
- **attribute_invalid_type**: `type` must be static on `<input>` with two-way binding
- **attribute_unquoted_sequence**: Attribute values with `{...}` must be quoted unless only containing the expression

## Bindings

- **bind_group_invalid_expression**: `bind:group` only accepts Identifier or MemberExpression
- **bind_invalid_expression**: Can only bind to Identifier, MemberExpression, or `{get, set}` pair
- **bind_invalid_value**: Can only bind to state or props

### Each Block Binding (Runes Mode)

**each_item_invalid_assignment**: Cannot reassign/bind to each block argument in runes mode.

```svelte
<!-- ❌ Legacy (not allowed in runes) -->
{#each array as entry}
  <button onclick={() => entry = 4}>change</button>
  <input bind:value={entry}>
{/each}

<!-- ✅ Runes mode -->
<script>
  let array = $state([1, 2, 3]);
</script>

{#each array as entry, i}
  <button onclick={() => array[i] = 4}>change</button>
  <input bind:value={array[i]}>
{/each}
```

## Blocks

- **block_invalid_elseif**: Use `else if`, not `elseif`
- **block_unclosed**: Block was left open
- **block_unexpected_close**: Unexpected block closing tag

## {@const} Tag

- **const_tag_invalid_placement**: `{@const}` must be immediate child of `{#snippet}`, `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>`, `<svelte:boundary>` or `<Component>`

**const_tag_invalid_reference**: `{@const}` not available across snippet boundaries

```svelte
<!-- ❌ Error -->
<svelte:boundary>
  {@const foo = 'bar'}
  {#snippet failed()}
    {foo} <!-- Not available here -->
  {/snippet}
</svelte:boundary>

<!-- Equivalent to: -->
<svelte:boundary>
  {#snippet children()}
    {@const foo = 'bar'}
  {/snippet}
  {#snippet failed()}
    {foo} <!-- foo is in different snippet -->
  {/snippet}
</svelte:boundary>
```

## CSS

- **css_global_block_invalid_list**: Cannot mix `:global` with scoped selectors in same list

```css
/* ❌ Invalid */
:global, x {
  y { color: red; }
}

/* ✅ Split into two */
:global {
  y { color: red; }
}
x y {
  color: red; }
```

- **css_global_invalid_placement**: `:global(...)` must be at start or end of selector, not middle
- **css_type_selector_invalid_placement**: `:global(...)` cannot be followed by type selector

## Runes

### $state

**state_invalid_placement**: `$state()` only valid as:
- Variable declaration initializer
- Class field declaration  
- First assignment to class field in constructor

**state_field_duplicate**: Cannot declare same state field twice

```js
class Counter {
  count = $state(0); // Declaration in class body
}

// OR

class Counter {
  constructor() {
    this.count = $state(0); // Declaration in constructor
  }
}
```

### $derived

**derived_invalid_export**: Cannot export derived state. Export a function returning its value instead.

### $effect

**effect_invalid_placement**: `$effect()` can only be used as an expression statement

### $props

- **props_invalid_placement**: `$props()` only at top level as variable declaration initializer
- **props_invalid_identifier**: `$props()` requires object destructuring pattern
- **props_invalid_pattern**: No nested properties or computed keys in `$props()`
- **props_duplicate**: Cannot use `$props()` more than once

### $bindable

**bindable_invalid_location**: `$bindable()` only inside `$props()` declaration

### General Rune Errors

- **rune_invalid_usage**: Cannot use runes in non-runes mode
- **rune_missing_parentheses**: Runes require parentheses
- **dollar_prefix_invalid**: `$` prefix reserved, cannot use for variables/imports

## Legacy Mode Restrictions

- **legacy_export_invalid**: Cannot use `export let` in runes mode — use `$props()`
- **legacy_reactive_statement_invalid**: `$:` not allowed in runes mode — use `$derived` or `$effect`
- **legacy_props_invalid**: Cannot use `$$props` in runes mode
- **legacy_rest_props_invalid**: Cannot use `$$restProps` in runes mode

## Event Handlers

- **mixed_event_handler_syntaxes**: Don't mix `on:name` and `onname` syntaxes
- **event_handler_invalid_component_modifier**: Only `once` modifier valid on components

## Snippets

**snippet_invalid_export**: Exported snippet can only reference `<script module>` declarations or other exportable snippets

```svelte
<!-- ❌ Error -->
<script module>
  export { greeting };
</script>
<script>
  let message = 'hello';
</script>
{#snippet greeting(name)}
  <p>{message} {name}!</p> <!-- references non-module script -->
{/snippet}
```

- **snippet_conflict**: Cannot use explicit children snippet with implicit children content
- **slot_snippet_conflict**: Cannot mix `<slot>` and `{@render ...}` in same component
- **snippet_parameter_assignment**: Cannot reassign/bind to snippet parameter

## Special Elements

### `<svelte:component>`
- **svelte_component_missing_this**: Requires `this` attribute

### `<svelte:element>`
- **svelte_element_missing_this**: Requires `this` attribute with value

### `<svelte:boundary>`
- **svelte_boundary_invalid_attribute**: Valid attributes: `onerror`, `failed`

### `<svelte:options>`
- **svelte_options_deprecated_tag**: Use `customElement` instead of `tag`
- **svelte_options_invalid_customelement**: Must be string or object: `{ tag?: string; shadow?: "open" | "none"; props?: {...} }`

### `<svelte:self>`
- **svelte_self_invalid_placement**: Only inside `{#if}`, `{#each}`, `{#snippet}` blocks or slots

## HTML Validation

**node_invalid_placement**: Browser will repair invalid HTML, breaking Svelte assumptions

Examples:
- `<p><div>...</div></p>` → `<p></p><div>...</div><p></p>`
- `<option><div>...</div></option>` → `<option>...</option>`
- `<table><tr>...</tr></table>` → `<table><tbody><tr>...</tr></tbody></table>`

## Stores

- **store_invalid_subscription_module**: Cannot reference store value outside `.svelte` files
- **store_invalid_scoped_subscription**: Cannot subscribe to stores not declared at component top level

## Miscellaneous

- **void_element_invalid_content**: Void elements cannot have children/closing tags
- **textarea_invalid_content**: `<textarea>` can have value attribute OR child content, not both
- **import_svelte_internal_forbidden**: `svelte/internal/*` imports forbidden