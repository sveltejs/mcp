# $app/forms

```js
import { applyAction, deserialize, enhance } from '$app/forms';
```

## applyAction

Updates `form` property and `page.status` of current page with given data. Redirects to nearest error page on error.

```dts
function applyAction<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	result: import('@sveltejs/kit').ActionResult<Success, Failure>
): Promise<void>;
```

## deserialize

Deserializes form submission response.

```js
// @errors: 7031
import { deserialize } from '$app/forms';

async function handleSubmit(event) {
	const response = await fetch('/form?/action', {
		method: 'POST',
		body: new FormData(event.target)
	});

	const result = deserialize(await response.text());
	// ...
}
```

```dts
function deserialize<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	result: string
): import('@sveltejs/kit').ActionResult<Success, Failure>;
```

## enhance

Progressive enhancement for `<form>` elements.

**`submit` function**: Called on submission with FormData and `action`. Call `cancel` to prevent submission. Use abort `controller` to cancel if another submission starts. Return a function to handle server response, or return nothing for default behavior.

**Default behavior**:
- Updates `form` prop if action is on same page
- Updates `page.status`
- Resets form and invalidates all data on successful submission (no redirect)
- Redirects on redirect response
- Redirects to error page on unexpected error

**Custom callback**: Call `update` for default behavior with options:
- `reset: false` - don't reset form values after success
- `invalidateAll: false` - don't call `invalidateAll` after submission

```dts
function enhance<
	Success extends Record<string, unknown> | undefined,
	Failure extends Record<string, unknown> | undefined
>(
	form_element: HTMLFormElement,
	submit?: import('@sveltejs/kit').SubmitFunction<Success, Failure>
): {
	destroy(): void;
};
```