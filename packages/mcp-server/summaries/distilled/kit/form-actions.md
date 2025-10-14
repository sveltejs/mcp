# Form Actions

`+page.server.js` files export actions to `POST` data to the server using `<form>` elements. Works without JavaScript, but can be progressively enhanced.

## Default Actions

```js
/// file: src/routes/login/+page.server.js
/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		// TODO log the user in
	}
};
```

```svelte
<!--- file: src/routes/login/+page.svelte --->
<form method="POST">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
</form>
```

Invoke from other pages with `action` attribute:

```html
<form method="POST" action="/login">
```

> Actions always use `POST` requests.

## Named Actions

```js
/// file: src/routes/login/+page.server.js
/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async (event) => {
		// TODO log the user in
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

Invoke with query parameter prefixed by `/`:

```svelte
<form method="POST" action="?/register">
```

```svelte
<form method="POST" action="/login?/register">
```

Use `formaction` on buttons:

```svelte
<form method="POST" action="?/login">
	<label>
		Email
		<input name="email" type="email">
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
	<button formaction="?/register">Register</button>
</form>
```

> Can't have default actions next to named actions - query parameter persists in URL.

## Action Anatomy

Actions receive `RequestEvent`, read data with `request.formData()`. Return data available via `form` prop and `page.form`.

```js
/// file: src/routes/login/+page.server.js
import * as db from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const user = await db.getUserFromSession(cookies.get('sessionid'));
	return { user };
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		const user = await db.getUser(email);
		cookies.set('sessionid', await db.createSession(user), { path: '/' });

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

```svelte
<!--- file: src/routes/login/+page.svelte --->
<script>
	/** @type {import('./$types').PageProps} */
	let { data, form } = $props();
</script>

{#if form?.success}
	<p>Successfully logged in! Welcome back, {data.user.name}</p>
{/if}
```

### Validation Errors

Use `fail()` to return HTTP status code (400/422) with validation errors:

```js
/// file: src/routes/login/+page.server.js
import { fail } from '@sveltejs/kit';
import * as db from '$lib/server/db';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		if (!email) {
			return fail(400, { email, missing: true });
		}

		const user = await db.getUser(email);

		if (!user || user.password !== db.hash(password)) {
			return fail(400, { email, incorrect: true });
		}

		cookies.set('sessionid', await db.createSession(user), { path: '/' });

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

```svelte
/// file: src/routes/login/+page.svelte
<form method="POST" action="?/login">
	{#if form?.missing}<p class="error">The email field is required</p>{/if}
	{#if form?.incorrect}<p class="error">Invalid credentials!</p>{/if}
	<label>
		Email
		<input name="email" type="email" value={form?.email ?? ''}>
	</label>
	<label>
		Password
		<input name="password" type="password">
	</label>
	<button>Log in</button>
	<button formaction="?/register">Register</button>
</form>
```

### Redirects

```js
/// file: src/routes/login/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import * as db from '$lib/server/db';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	login: async ({ cookies, request, url }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');

		const user = await db.getUser(email);
		if (!user) {
			return fail(400, { email, missing: true });
		}

		if (user.password !== db.hash(password)) {
			return fail(400, { email, incorrect: true });
		}

		cookies.set('sessionid', await db.createSession(user), { path: '/' });

		if (url.searchParams.has('redirectTo')) {
			redirect(303, url.searchParams.get('redirectTo'));
		}

		return { success: true };
	},
	register: async (event) => {
		// TODO register the user
	}
};
```

## Loading Data

Page re-renders after action runs. `load` functions run after action completes.

`handle` runs before action and doesn't rerun before `load`. Update `event.locals` in actions if needed:

```js
/// file: src/hooks.server.js
/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.user = await getUser(event.cookies.get('sessionid'));
	return resolve(event);
}
```

```js
/// file: src/routes/account/+page.server.js
/** @type {import('./$types').PageServerLoad} */
export function load(event) {
	return {
		user: event.locals.user
	};
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	logout: async (event) => {
		event.cookies.delete('sessionid', { path: '/' });
		event.locals.user = null;
	}
};
```

## Progressive Enhancement

### use:enhance

```svelte
/// file: src/routes/login/+page.svelte
<script>
	import { enhance } from '$app/forms';

	/** @type {import('./$types').PageProps} */
	let { form } = $props();
</script>

<form method="POST" use:enhance>
```

> Only works with `method="POST"` pointing to `+page.server.js` actions.

Without arguments, `use:enhance`:
- Updates `form`, `page.form`, `page.status` on success/invalid response (only if action is on same page)
- Resets `<form>` element
- Invalidates all data with `invalidateAll` on success
- Calls `goto` on redirect
- Renders nearest `+error` boundary on error
- Resets focus

### Customising use:enhance

```svelte
<form
	method="POST"
	use:enhance={({ formElement, formData, action, cancel, submitter }) => {
		// `formElement` is this `<form>` element
		// `formData` is its `FormData` object that's about to be submitted
		// `action` is the URL to which the form is posted
		// calling `cancel()` will prevent the submission
		// `submitter` is the `HTMLElement` that caused the form to be submitted

		return async ({ result, update }) => {
			// `result` is an `ActionResult` object
			// `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
		};
	}}
>
```

Use `applyAction` to apply default behavior:

```svelte
/// file: src/routes/login/+page.svelte
<script>
	import { enhance, applyAction } from '$app/forms';

	/** @type {import('./$types').PageProps} */
	let { form } = $props();
</script>

<form
	method="POST"
	use:enhance={({ formElement, formData, action, cancel }) => {
		return async ({ result }) => {
			// `result` is an `ActionResult` object
			if (result.type === 'redirect') {
				goto(result.location);
			} else {
				await applyAction(result);
			}
		};
	}}
>
```

`applyAction(result)` behavior:
- `success`, `failure` — sets `page.status`, updates `form` and `page.form` (regardless of submission location)
- `redirect` — calls `goto(result.location, { invalidateAll: true })`
- `error` — renders nearest `+error` boundary

### Custom Event Listener

```svelte
<!--- file: src/routes/login/+page.svelte --->
<script>
	import { invalidateAll, goto } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms';

	/** @type {import('./$types').PageProps} */
	let { form } = $props();

	/** @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement}} event */
	async function handleSubmit(event) {
		event.preventDefault();
		const data = new FormData(event.currentTarget, event.submitter);

		const response = await fetch(event.currentTarget.action, {
			method: 'POST',
			body: data
		});

		/** @type {import('@sveltejs/kit').ActionResult} */
		const result = deserialize(await response.text());

		if (result.type === 'success') {
			// rerun all `load` functions, following the successful update
			await invalidateAll();
		}

		applyAction(result);
	}
</script>

<form method="POST" onsubmit={handleSubmit}>
	<!-- content -->
</form>
```

Use `deserialize()` not `JSON.parse()` - supports `Date` and `BigInt`.

If `+server.js` exists alongside `+page.server.js`, add header to POST to action:

```js
const response = await fetch(this.action, {
	method: 'POST',
	body: data,
	headers: {
		'x-sveltekit-action': 'true'
	}
});
```

## Alternatives

Use `+server.js` for JSON APIs:

```svelte
<!--- file: src/routes/send-message/+page.svelte --->
<script>
	function rerun() {
		fetch('/api/ci', {
			method: 'POST'
		});
	}
</script>

<button onclick={rerun}>Rerun CI</button>
```

```js
/// file: src/routes/api/ci/+server.js
/** @type {import('./$types').RequestHandler} */
export function POST() {
	// do something
}
```

## GET vs POST

Use `method="GET"` for forms that don't POST data (e.g., search). SvelteKit treats them like `<a>` elements:

```html
<form action="/search">
	<label>
		Search
		<input name="q">
	</label>
</form>
```

Navigates to `/search?q=...`, invokes `load` but not actions. Supports `data-sveltekit-*` attributes like links.