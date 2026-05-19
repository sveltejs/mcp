---
title: Tools
---

The following tools are provided by the MCP server to the model you are using, which can decide to call one or more of them during a session:

## list-sections

Provides a list of all the available documentation sections.

## get-documentation

Allows the model to get the full (and up-to-date) documentation for the requested sections directly from [svelte.dev/docs](/docs).

## svelte-autofixer

Uses static analysis to provide suggestions for code that your LLM generates. It can be invoked in an agentic loop by your model until all issues and suggestions are resolved.

### Suppressing suggestions

Some custom-visitor suggestions are heuristic — they're written to nudge a model toward a Svelte 5 idiom, but they can fire on perfectly reasonable code (e.g. an `$effect` that imperatively pushes state into a third-party library, where `$derived` genuinely doesn't apply). You can silence a single suggestion on the next line with a `svelte-mcp-ignore` comment, modelled after `svelte-ignore` and `eslint-disable-next-line`:

```svelte
<script>
	// svelte-mcp-ignore effect_calls_function
	$effect(() => {
		external_library.set(value); // not a $derived candidate
	});
</script>

<!-- svelte-mcp-ignore bind_this_attachment -->
<canvas bind:this={canvas}></canvas>
```

The directive scopes to **the immediately following line** — the same shape `svelte-ignore` uses for compiler warnings. Multiple codes can be listed on one directive (`// svelte-mcp-ignore effect_calls_function effect_assigns_state`). Stale or typo'd codes surface as a follow-up suggestion so the comments don't quietly rot.

Available codes:

| Code                          | What it silences                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `effect_calls_function`       | "You are calling a function inside an `$effect`."                                |
| `effect_assigns_state`        | "The stateful variable X is assigned inside an `$effect`."                       |
| `bind_this_attachment`        | "`bind:this` can often be replaced with an `attachment`."                        |
| `use_action_attachment`       | "Consider using an `attachment` instead of an `action`."                         |
| `derived_with_function`       | "You are passing a function to `$derived` … use `$derived.by` instead."          |
| `imported_runes`              | "You are importing `state` / `effect` / … from `svelte`. Runes are global."      |
| `runes_instead_of_store`      | "You are importing `derived` / `writable` / `readable` from `svelte/store`."     |
| `wrong_property_access_state` | "You are trying to update the stateful variable X using `set` / `update` / `$`." |

## playground-link

Generates an ephemeral playground link with the generated code. It's useful when the generated code is not written to a file in your project and you want to quickly test the generated solution. The code is not stored anywhere except the URL itself (which will often, as a consequence, be quite large).
