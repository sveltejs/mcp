# style: directive

Shorthand for setting styles on elements.

## Basic Usage

```svelte
<!-- These are equivalent -->
<div style:color="red">...</div>
<div style="color: red;">...</div>
```

## With Expressions

```svelte
<div style:color={myColor}>...</div>
```

## Shorthand Form

```svelte
<div style:color>...</div>
```

## Multiple Styles

```svelte
<div style:color style:width="12rem" style:background-color={darkMode ? 'black' : 'white'}>...</div>
```

## Important Modifier

```svelte
<div style:color|important="red">...</div>
```

## Precedence

`style:` directives always take precedence over `style` attributes, even over `!important`:

```svelte
<div style:color="red" style="color: blue">This will be red</div>
<div style:color="red" style="color: blue !important">This will still be red</div>
```