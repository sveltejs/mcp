# $state

Creates reactive state that updates the UI when changed.

```svelte
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>
	clicks: {count}
</button>
```

`count` is just a number, not an object or function. Update it like any variable.

## Deep state

Arrays and simple objects become deeply reactive proxies. Svelte intercepts reads/writes to trigger granular updates.

```js
let todos = $state([
	{
		done: false,
		text: 'add more todos'
	}
]);
```

Modifying nested properties triggers updates:

```js
todos[0].done = !todos[0].done;
```

Pushed objects are also proxified:

```js
todos.push({
	done: false,
	text: 'eat lunch'
});
```

**Gotcha:** Destructuring breaks reactivity (evaluated at destructure time):

```js
let { done, text } = todos[0];

// this will NOT affect the value of `done`
todos[0].done = !todos[0].done;
```

## Classes

Use `$state` in class fields or as first assignment in constructor:

```js
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	reset() {
		this.text = '';
		this.done = false;
	}
}
```

**Gotcha:** `this` binding in methods. This won't work:

```svelte
<button onclick={todo.reset}>
	reset
</button>
```

Fix with inline function:

```svelte
<button onclick={() => todo.reset()}>
	reset
</button>
```

Or arrow function in class:

```js
class Todo {
	done = $state(false);

	constructor(text) {
		this.text = $state(text);
	}

	reset = () => {
		this.text = '';
		this.done = false;
	}
}
```

## Built-in classes

Import reactive `Set`, `Map`, `Date`, `URL` from `svelte/reactivity`.

## $state.raw

Non-deeply reactive state. Cannot mutate, only reassign:

```js
let person = $state.raw({
	name: 'Heraclitus',
	age: 49
});

// no effect
person.age += 1;

// works - new object
person = {
	name: 'Heraclitus',
	age: 50
};
```

Improves performance for large arrays/objects you won't mutate. Raw state can contain reactive state.

## $state.snapshot

Takes static snapshot of reactive proxy:

```svelte
<script>
	let counter = $state({ count: 0 });

	function onclick() {
		// Logs `{ count: ... }` not `Proxy { ... }`
		console.log($state.snapshot(counter));
	}
</script>
```

Useful for external libraries/APIs that don't expect proxies (e.g., `structuredClone`).

## Passing state into functions

JavaScript is pass-by-value. To access current values, use functions:

```js
function add(getA, getB) {
	return () => getA() + getB();
}

let a = $state(1);
let b = $state(2);
let total = add(() => a, () => b);
console.log(total()); // 3

a = 3;
b = 4;
console.log(total()); // 7
```

Or use getters:

```js
function add(input) {
	return {
		get value() {
			return input.a + input.b;
		}
	};
}

let input = $state({ a: 1, b: 2 });
let total = add(input);
console.log(total.value); // 3

input.a = 3;
input.b = 4;
console.log(total.value); // 7
```

## Passing state across modules

**Cannot directly export reassignable state:**

```js
// ❌ Not allowed
export let count = $state(0);

export function increment() {
	count += 1;
}
```

**Option 1:** Export object, update properties:

```js
export const counter = $state({
	count: 0
});

export function increment() {
	counter.count += 1;
}
```

**Option 2:** Export getter/setter functions:

```js
let count = $state(0);

export function getCount() {
	return count;
}

export function increment() {
	count += 1;
}
```