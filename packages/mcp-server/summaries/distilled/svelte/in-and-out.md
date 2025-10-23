# `in:` and `out:` Directives

Separate directives for enter/exit transitions. Unlike `transition:`, these are **not bidirectional** — `in` and `out` play simultaneously if block is toggled during transition.

```svelte
<script>
  import { fade, fly } from 'svelte/transition';
  
  let visible = $state(false);
</script>

<label>
  <input type="checkbox" bind:checked={visible}>
  visible
</label>

{#if visible}
	<div in:fly={{ y: 200 }} out:fade>flies in, fades out</div>
{/if}
```

**Key difference**: If `out` transition is aborted, transitions restart from scratch (no reversal).