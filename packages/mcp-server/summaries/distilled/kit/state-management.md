# State Management

## Avoid shared state on the server

Servers are shared by multiple users. **Never store data in shared variables** - it will leak between users.

```js
// @errors: 7034 7005
/// file: +page.server.js
let user;

/** @type {import('./$types').PageServerLoad} */
export function load() {
	return { user };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		// NEVER DO THIS!
		user = {
			name: data.get('name'),
			embarrassingSecret: data.get('secret')
		};
	}
}
```

**Solution:** Use [`cookies`](load#Cookies) for authentication and persist to a database.

## No side-effects in load

`load` functions must be **pure** - no side-effects. Don't write to stores or global state:

```js
/// file: +page.js
// @filename: ambient.d.ts
declare module '$lib/user' {
	export const user: { set: (value: any) => void };
}

// @filename: index.js
// ---cut---
import { user } from '$lib/user';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const response = await fetch('/api/user');

	// NEVER DO THIS!
	user.set(await response.json());
}
```

**Solution:** Return data directly:

```js
/// file: +page.js
/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
	const response = await fetch('/api/user');

	return {
		user: await response.json()
	};
}
```

Pass to components or use [`page.data`](load#page.data).

## Using state with context

Use Svelte's context API to share state safely:

```svelte
<!--- file: src/routes/+layout.svelte --->
<script>
	import { setContext } from 'svelte';

	/** @type {import('./$types').LayoutProps} */
	let { data } = $props();

	// Pass a function referencing our state
	// to the context for child components to access
	setContext('user', () => data.user);
</script>
```

```svelte
<!--- file: src/routes/user/+page.svelte --->
<script>
	import { getContext } from 'svelte';

	// Retrieve user store from context
	const user = getContext('user');
</script>

<p>Welcome {user().name}</p>
```

> **Note:** Pass a function to `setContext` to maintain reactivity. See [$state docs](/docs/svelte/$state#Passing-state-into-functions).

**Gotcha:** Updating context state in child components during SSR won't affect parent components (already rendered). Prefer passing state down.

Without SSR, you can use shared modules safely.

## Component state is preserved

Components are **reused** during navigation. State doesn't reset automatically:

```svelte
<!--- file: src/routes/blog/[slug]/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	// THIS CODE IS BUGGY!
	const wordCount = data.content.split(' ').length;
	const estimatedReadingTime = wordCount / 250;
</script>

<header>
	<h1>{data.title}</h1>
	<p>Reading time: {Math.round(estimatedReadingTime)} minutes</p>
</header>

<div>{@html data.content}</div>
```

**Solution:** Use `$derived`:

```svelte
/// file: src/routes/blog/[slug]/+page.svelte
<script>
	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	let wordCount = $derived(data.content.split(' ').length);
	let estimatedReadingTime = $derived(wordCount / 250);
</script>
```

> **Note:** Use [afterNavigate]($app-navigation#afterNavigate) and [beforeNavigate]($app-navigation#beforeNavigate) if you need to re-run `onMount`/`onDestroy` logic.

**Force remount** with `{#key}`:

```svelte
<script>
	import { page } from '$app/state';
</script>

{#key page.url.pathname}
	<BlogPost title={data.title} content={data.title} />
{/key}
```

## State storage patterns

- **URL search params** (`?sort=price`): For state that should survive reload/affect SSR. Access via `url` in `load` or `page.url.searchParams` in components.
- **Snapshots**: For ephemeral UI state (e.g., "is accordion open?") that should persist across navigation but not reload. See [snapshots](snapshots).