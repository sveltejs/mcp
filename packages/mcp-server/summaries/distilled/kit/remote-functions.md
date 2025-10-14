# Remote Functions

**Available since 2.27** - Experimental feature for type-safe client-server communication.

## Setup

Enable in `svelte.config.js`:

```js
/// file: svelte.config.js
const config = {
	kit: {
		experimental: {
			remoteFunctions: true
		}
	},
	compilerOptions: {
		experimental: {
			async: true // optional, for await in components
		}
	}
};
```

## Overview

Export from `.remote.js` or `.remote.ts` files in `src/`. Four types: `query`, `form`, `command`, `prerender`. Client calls become `fetch` wrappers to generated HTTP endpoints.

---

## query

Read dynamic data from server:

```js
/// file: src/routes/blog/data.remote.js
import { query } from '$app/server';
import * as db from '$lib/server/database';

export const getPosts = query(async () => {
	const posts = await db.sql`
		SELECT title, slug FROM post ORDER BY published_at DESC
	`;
	return posts;
});
```

Use with `await`:

```svelte
<!--- file: src/routes/blog/+page.svelte --->
<script>
	import { getPosts } from './data.remote';
</script>

<ul>
	{#each await getPosts() as { title, slug }}
		<li><a href="/blog/{slug}">{title}</a></li>
	{/each}
</ul>
```

Or with properties:

```svelte
<script>
	const query = getPosts();
</script>

{#if query.error}
	<p>oops!</p>
{:else if query.loading}
	<p>loading...</p>
{:else}
	<ul>
		{#each query.current as { title, slug }}
			<li><a href="/blog/{slug}">{title}</a></li>
		{/each}
	</ul>
{/if}
```

### Query arguments

Validate with Standard Schema (Zod/Valibot):

```js
import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query } from '$app/server';

export const getPost = query(v.string(), async (slug) => {
	const [post] = await db.sql`SELECT * FROM post WHERE slug = ${slug}`;
	if (!post) error(404, 'Not found');
	return post;
});
```

```svelte
<script>
	let { params } = $props();
	const post = $derived(await getPost(params.slug));
</script>
```

Arguments and return values serialized with [devalue](https://github.com/sveltejs/devalue).

### Refreshing

```svelte
<button onclick={() => getPosts().refresh()}>
	Check for new posts
</button>
```

Queries are cached: `getPosts() === getPosts()`.

---

## query.batch

Batches requests in same macrotask (solves n+1 problem):

```js
import * as v from 'valibot';
import { query } from '$app/server';

export const getWeather = query.batch(v.string(), async (cities) => {
	const weather = await db.sql`SELECT * FROM weather WHERE city = ANY(${cities})`;
	const lookup = new Map(weather.map(w => [w.city, w]));
	return (city) => lookup.get(city);
});
```

---

## form

Write data to server:

```js
/// file: src/routes/blog/data.remote.js
import * as v from 'valibot';
import { error, redirect } from '@sveltejs/kit';
import { form } from '$app/server';
import * as auth from '$lib/server/auth';

export const createPost = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		const user = await auth.getUser();
		if (!user) error(401, 'Unauthorized');

		const slug = title.toLowerCase().replace(/ /g, '-');
		await db.sql`INSERT INTO post (slug, title, content) VALUES (${slug}, ${title}, ${content})`;
		redirect(303, `/blog/${slug}`);
	}
);
```

```svelte
<script>
	import { createPost } from '../data.remote';
</script>

<form {...createPost}>
	<button>Publish!</button>
</form>
```

Works without JS (native form submission) and progressively enhances.

### Fields

Use `.as(type)` for field attributes:

```svelte
<form {...createPost}>
	<label>
		<h2>Title</h2>
		<input {...createPost.fields.title.as('text')} />
	</label>

	<label>
		<h2>Write your post</h2>
		<textarea {...createPost.fields.content.as('text')}></textarea>
	</label>

	<button>Publish!</button>
</form>
```

Supports nested objects, arrays, strings, numbers, booleans, `File`:

```js
const datingProfile = v.object({
	name: v.string(),
	photo: v.file(),
	info: v.object({
		height: v.number(),
		likesDogs: v.optional(v.boolean(), false)
	}),
	attributes: v.array(v.string())
});

export const createProfile = form(datingProfile, (data) => { /* ... */ });
```

```svelte
<form {...createProfile} enctype="multipart/form-data">
	<input {...name.as('text')} />
	<input {...photo.as('file')} />
	<input {...info.height.as('number')} />
	<input {...info.likesDogs.as('checkbox')} />
	<input {...attributes[0].as('text')} />
	<button>submit</button>
</form>
```

For `radio`/`checkbox` groups, pass value as second arg:

```svelte
{#each ['windows', 'mac', 'linux'] as os}
	<label>
		<input {...survey.fields.operatingSystem.as('radio', os)}>
		{os}
	</label>
{/each}
```

Or use `select`:

```svelte
<select {...survey.fields.operatingSystem.as('select')}>
	<option>windows</option>
	<option>mac</option>
</select>
```

### Programmatic validation

Use `invalid` function in handler:

```js
export const buyHotcakes = form(
	v.object({ qty: v.pipe(v.number(), v.minValue(1)) }),
	async (data, invalid) => {
		try {
			await db.buy(data.qty);
		} catch (e) {
			if (e.code === 'OUT_OF_STOCK') {
				invalid(invalid.qty(`we don't have enough hotcakes`));
			}
		}
	}
);
```

### Validation

Show issues per field:

```svelte
{#each createPost.fields.title.issues() as issue}
	<p class="issue">{issue.message}</p>
{/each}
<input {...createPost.fields.title.as('text')} />
```

Validate programmatically:

```svelte
<form {...createPost} oninput={() => createPost.validate()}>
```

Client-side preflight validation:

```svelte
<script>
	import * as v from 'valibot';
	const schema = v.object({
		title: v.pipe(v.string(), v.nonEmpty()),
		content: v.pipe(v.string(), v.nonEmpty())
	});
</script>

<form {...createPost.preflight(schema)}>
```

All issues: `createPost.fields.allIssues()`.

### Getting/setting values

```svelte
<div class="preview">
	<h2>{createPost.fields.title.value()}</h2>
</div>
```

Set values:

```svelte
<script>
	createPost.fields.set({
		title: 'My new blog post',
		content: 'Lorem ipsum...'
	});
</script>
```

### Sensitive data

Prefix with `_` to prevent sending back to client:

```svelte
<input {...register.fields._password.as('password')} />
```

### Single-flight mutations

Refresh specific queries instead of all:

```js
export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// ...
		await getPosts().refresh();
		// or: await getPost(post.id).set(result);
		redirect(303, `/blog/${slug}`);
	}
);
```

### Returns

Return data instead of redirecting:

```js
export const createPost = form(
	v.object({/* ... */}),
	async (data) => {
		// ...
		return { success: true };
	}
);
```

```svelte
{#if createPost.result?.success}
	<p>Successfully published!</p>
{/if}
```

### enhance

Customize submission:

```svelte
<form {...createPost.enhance(async ({ form, data, submit }) => {
	try {
		await submit();
		form.reset();
		showToast('Successfully published!');
	} catch (error) {
		showToast('Oh no! Something went wrong');
	}
})}>
```

Client-driven single-flight mutations:

```ts
await submit().updates(getPosts());
```

With optimistic updates:

```ts
await submit().updates(
	getPosts().withOverride((posts) => [newPost, ...posts])
);
```

### Multiple instances

Isolate forms in lists:

```svelte
{#each await getTodos() as todo}
	{@const modify = modifyTodo.for(todo.id)}
	<form {...modify}>
		<button disabled={!!modify.pending}>save changes</button>
	</form>
{/each}
```

### buttonProps

Different action per button:

```svelte
<form {...login}>
	<button>login</button>
	<button {...register.buttonProps}>register</button>
</form>
```

---

## command

Call from anywhere (not element-specific):

```js
import * as v from 'valibot';
import { query, command } from '$app/server';

export const getLikes = query(v.string(), async (id) => {
	const [row] = await db.sql`SELECT likes FROM item WHERE id = ${id}`;
	return row.likes;
});

export const addLike = command(v.string(), async (id) => {
	await db.sql`UPDATE item SET likes = likes + 1 WHERE id = ${id}`;
});
```

```svelte
<button
	onclick={async () => {
		try {
			await addLike(item.id);
		} catch (error) {
			showToast('Something went wrong!');
		}
	}}
>
	add like
</button>
```

Cannot be called during render.

### Updating queries

In command:

```js
export const addLike = command(v.string(), async (id) => {
	await db.sql`UPDATE item SET likes = likes + 1 WHERE id = ${id}`;
	getLikes(id).refresh();
});
```

Or when calling:

```ts
await addLike(item.id).updates(getLikes(item.id));
```

With optimistic update:

```ts
await addLike(item.id).updates(
	getLikes(item.id).withOverride((n) => n + 1)
);
```

---

## prerender

Invoked at build time for static data:

```js
import { prerender } from '$app/server';

export const getPosts = prerender(async () => {
	const posts = await db.sql`SELECT title, slug FROM post ORDER BY published_at DESC`;
	return posts;
});
```

Cached using Cache API, survives reloads, cleared on new deployment.

### Prerender arguments

```js
export const getPost = prerender(v.string(), async (slug) => {
	const [post] = await db.sql`SELECT * FROM post WHERE slug = ${slug}`;
	if (!post) error(404, 'Not found');
	return post;
});
```

Specify inputs:

```js
export const getPost = prerender(
	v.string(),
	async (slug) => { /* ... */ },
	{
		inputs: () => ['first-post', 'second-post', 'third-post']
	}
);
```

Allow dynamic calls:

```js
export const getPost = prerender(
	v.string(),
	async (slug) => { /* ... */ },
	{
		dynamic: true,
		inputs: () => [/* ... */]
	}
);
```

---

## Validation errors

Handle with `handleValidationError` hook:

```js
/// file: src/hooks.server.ts
export function handleValidationError({ event, issues }) {
	return {
		message: 'Nice try, hacker!'
	};
}
```

Opt out with `'unchecked'`:

```ts
export const getStuff = query('unchecked', async ({ id }: { id: string }) => {
	// no validation
});
```

---

## getRequestEvent

Access `RequestEvent` inside remote functions:

```ts
import { getRequestEvent, query } from '$app/server';

const getUser = query(() => {
	const { cookies } = getRequestEvent();
	return await findUser(cookies.get('session_id'));
});
```

**Note:** `route`, `params`, `url` relate to calling page, not endpoint. Queries don't re-run on navigation unless argument changes.

---

## Redirects

Use `redirect(...)` in `query`, `form`, `prerender`. **Not** in `command`.