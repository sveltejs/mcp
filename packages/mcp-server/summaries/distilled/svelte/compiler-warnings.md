# Svelte Warnings

## Disabling Warnings

Use `<!-- svelte-ignore <code> -->` above the line causing the warning:

```svelte
<!-- svelte-ignore a11y_autofocus -->
<input autofocus />
```

Multiple rules (comma-separated) with optional note:

```svelte
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
<div onclick>...</div>
```

## Accessibility (a11y)

### a11y_accesskey
Avoid `accesskey` - creates accessibility complications.

### a11y_aria_activedescendant_has_tabindex
Elements with `aria-activedescendant` must have `tabindex`.

### a11y_aria_attributes
Reserved elements (`meta`, `html`, `script`, `style`) cannot have `aria-*` attributes.

### a11y_autofocus
Avoid `autofocus` - causes usability issues.

### a11y_click_events_have_key_events
Visible, non-interactive elements with `onclick` need keyboard handler (`onkeyup`/`onkeydown`) and `tabindex`. Consider using `<button>` or `<a>` instead.

```svelte
<!-- A11y: visible, non-interactive elements with an onclick event must be accompanied by a keyboard event handler. -->
<div onclick={() => {}}></div>
```

### a11y_distracting_elements
Avoid `<marquee>` and `<blink>`.

### a11y_figcaption_index / a11y_figcaption_parent
`<figcaption>` must be first/last child and immediate child of `<figure>`.

### a11y_hidden
Don't hide important elements (headings, etc.) with `aria-hidden`.

### a11y_img_redundant_alt
Don't use "image", "photo", "picture" in alt text - screen readers already announce images.

### a11y_incorrect_aria_attribute_type
Use correct value types for ARIA attributes (e.g., `aria-hidden` needs boolean).

### a11y_interactive_supports_focus
Interactive roles need `tabindex`.

### a11y_invalid_attribute
Attributes like `href` shouldn't be empty, `'#'`, or `javascript:`.

### a11y_label_has_associated_control
Labels need associated control (wrap input or use `for` attribute).

### a11y_media_has_caption
`<video>` needs `<track kind="captions">` (unless `muted`).

### a11y_misplaced_role
Reserved elements (`meta`, `html`, `script`, `style`) cannot have `role`.

### a11y_misplaced_scope
`scope` attribute only for `<th>` elements.

### a11y_missing_attribute
Required attributes:
- `<a>`: `href`
- `<area>`: `alt`, `aria-label`, or `aria-labelledby`
- `<html>`: `lang`
- `<iframe>`: `title`
- `<img>`: `alt`
- `<object>`: `title`, `aria-label`, or `aria-labelledby`
- `<input type="image">`: `alt`, `aria-label`, or `aria-labelledby`

### a11y_missing_content
Headings and anchors need accessible content.

### a11y_mouse_events_have_key_events
`onmouseover` needs `onfocus`, `onmouseout` needs `onblur`.

### a11y_no_abstract_role
Don't use abstract ARIA roles.

### a11y_no_interactive_element_to_noninteractive_role
Don't convert interactive elements (e.g., `<textarea>`) to non-interactive roles.

### a11y_no_noninteractive_element_interactions
Non-interactive elements (`<main>`, `<p>`, `<img>`, `<li>`, etc.) shouldn't have mouse/keyboard handlers.

### a11y_no_noninteractive_element_to_interactive_role
Don't convert non-interactive elements to interactive roles.

### a11y_no_noninteractive_tabindex
Non-interactive elements can't have non-negative `tabindex`.

### a11y_no_redundant_roles
Don't specify roles already set by browser (e.g., `<button role="button">`).

### a11y_no_static_element_interactions
Elements like `<div>` with handlers need ARIA role.

### a11y_positive_tabindex
Avoid `tabindex` values above zero.

### a11y_role_has_required_aria_props
ARIA roles need all required attributes.

### a11y_role_supports_aria_props
Only use `aria-*` attributes supported by the role.

### a11y_unknown_aria_attribute
Use valid ARIA attributes from WAI-ARIA spec.

### a11y_unknown_role
Use valid, non-abstract ARIA roles.

## HTML & Attributes

### attribute_avoid_is
Avoid `is` attribute - not cross-browser compatible.

### attribute_illegal_colon
Don't use `:` in attributes (conflicts with Svelte directives).

### attribute_quoted
Quoted attributes on components/custom elements will be stringified in future versions.

### bidirectional_control_characters
Bidirectional control characters detected - can alter code direction unexpectedly.

### element_implicitly_closed
Some elements implicitly close others (e.g., `<p>` inside `<p>`). Use explicit closing tags.

### element_invalid_self_closing_tag
Use `<span></span>` not `<span />` for non-void elements. Run `npx sv migrate self-closing-tags`.

### node_invalid_placement_ssr
HTML structure violations cause browser repairs, breaking hydration.

## Component & Script

### bind_invalid_each_rest
Rest operator creates new object - binding won't work with original.

### component_name_lowercase
Components must start with capital letter.

### export_let_unused
Unused export property. Use `export const` for external reference.

### legacy_component_creation
Use `mount` or `hydrate` (from 'svelte') instead of class instantiation.

### script_context_deprecated
Use `<script module>` instead of `<script context="module">`.

### script_unknown_attribute
Valid attributes: `generics`, `lang`, `module`.

## Svelte 5 Specific

### event_directive_deprecated
Use `on%name%` instead of `on:%name%`.

### slot_element_deprecated
Use `{@render ...}` instead of `<slot>`.

### svelte_component_deprecated
Components are dynamic by default - `<svelte:component>` unnecessary. Use `<Component />` or intermediary variable:

```svelte
{#each items as item}
	{@const Component = item.condition ? Y : Z}
	<Component />
{/each}
```

### svelte_self_deprecated
Use self-imports instead: `import %name% from './%basename%'`.

### custom_element_props_identifier
Destructure `$props()` or specify `customElement.props` for custom elements.

## State & Reactivity

### non_reactive_update
Variable updated but not declared with `$state()`. Wrap with `$state`:

```svelte
<script>
	let reactive = $state('reactive');
	let stale = 'stale'; // Warning: won't trigger updates
</script>
```

### state_referenced_locally
Passing state directly breaks reactivity link. Wrap in function for lazy evaluation:

```svelte
<script>
	let count = $state(0);
	// Wrong: setContext('count', count);
	setContext('count', () => count); // Correct
</script>
```

### reactive_declaration_invalid_placement
Reactive declarations only at top level of instance script.

### store_rune_conflict
Rename local binding to avoid conflict with `$` rune prefix.

## Options & Config

### options_deprecated_accessors / options_deprecated_immutable
No effect in runes mode.

### options_removed_enable_sourcemap
Source maps always generated.

### options_removed_hydratable
Components always hydratable.

### options_renamed_ssr_dom
Use `"client"` and `"server"` instead of `"dom"` and `"ssr"`.

## CSS

### css_unused_selector
Unused selector. Use `:global` for `{@html}` or child component styles:

```svelte
<style>
  .post :global {
    p {...}
  }
</style>
```

## Performance

### perf_avoid_inline_class / perf_avoid_nested_class
Declare classes at top level scope.