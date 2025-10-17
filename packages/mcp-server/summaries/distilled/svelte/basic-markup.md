# Svelte Markup

## Tags

- Lowercase tags (`<div>`) = HTML elements
- Capitalized or dot notation (`<Widget>`, `<my.stuff>`) = components

```svelte
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget />
</div>
```

## Element Attributes

Attributes work like HTML. Values can contain or be JavaScript expressions.

```svelte
<div class="foo">
	<button disabled>can't touch this</button>
</div>

<input type=checkbox />

<a href="page/{p}">page {p}</a>

<button disabled={!clickable}>...</button>
```

**Inclusion rules:**
- Boolean attributes: included if truthy, excluded if falsy
- Other attributes: included unless nullish (`null`/`undefined`)

```svelte
<input required={false} placeholder="This input field is not required" />
<div title={null}>This div has no title attribute</div>
```

**Shorthand:** `{name}` replaces `name={name}`

```svelte
<button {disabled}>...</button>
```

## Component Props

Same rules as attributes. Use `{name}` shorthand.

```svelte
<Widget foo={bar} answer={42} text="hello" />
```

## Spread Attributes

Spread multiple attributes/props at once. Order matters for precedence.

```svelte
<Widget a="b" {...things} c="d" />
```

## Events

Use `on` prefix (case sensitive). `onclick` listens to `click`, `onClick` listens to `Click`.

```svelte
<button onclick={() => console.log('clicked')}>click me</button>
```

Event attributes support shorthand and spreading. Fire after bindings update.

**Passive events:** `ontouchstart` and `ontouchmove` are passive for performance. Use `on` from `svelte/events` if you need `preventDefault()`.

### Event Delegation

Svelte delegates certain events to the application root for performance.

**Gotchas:**
- Manually dispatched events need `{ bubbles: true }`
- Avoid `stopPropagation` with `addEventListener` directly
- Use `on` from `svelte/events` instead of `addEventListener` for correct ordering

**Delegated events:** `beforeinput`, `click`, `change`, `dblclick`, `contextmenu`, `focusin`, `focusout`, `input`, `keydown`, `keyup`, `mousedown`, `mousemove`, `mouseout`, `mouseover`, `mouseup`, `pointerdown`, `pointermove`, `pointerout`, `pointerover`, `pointerup`, `touchend`, `touchmove`, `touchstart`

## Text Expressions

JavaScript expressions in curly braces. `null`/`undefined` omitted, others coerced to strings.

```svelte
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>

<div>{(/^[A-Za-z ]+$/).test(value) ? x : y}</div>
```

**HTML rendering:** Use `{@html}` (escape to prevent XSS)

```svelte
{@html potentiallyUnsafeHtmlString}
```

## Comments

HTML comments work. `svelte-ignore` disables warnings for next markup block.

```svelte
<!-- this is a comment! --><h1>Hello world</h1>

<!-- svelte-ignore a11y_autofocus -->
<input bind:value={name} autofocus />
```

**Component docs:** `@component` comments show on hover.

````svelte
<!--
@component
- You can use markdown here.
- Usage:
  ```html
  <Main name="Arethra">
  ```
-->
<script>
	let { name } = $props();
</script>

<main>
	<h1>Hello, {name}</h1>
</main>
````