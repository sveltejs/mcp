# svelte/store

```js
import {
	derived,
	fromStore,
	get,
	readable,
	readonly,
	toStore,
	writable
} from 'svelte/store';
```

## Core Store Types

### writable
Create a store with read/write access via subscription.

```dts
function writable<T>(
	value?: T | undefined,
	start?: StartStopNotifier<T> | undefined
): Writable<T>;
```

### readable
Create a read-only store.

```dts
function readable<T>(
	value?: T | undefined,
	start?: StartStopNotifier<T> | undefined
): Readable<T>;
```

### derived
Derive values from one or more stores with aggregation function.

```dts
function derived<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T,
	initial_value?: T | undefined
): Readable<T>;
```

```dts
function derived<S extends Stores, T>(
	stores: S,
	fn: (
		values: StoresValues<S>,
		set: (value: T) => void,
		update: (fn: Updater<T>) => void
	) => Unsubscriber | void,
	initial_value?: T | undefined
): Readable<T>;
```

## Utilities

### get
Get current value by subscribing and immediately unsubscribing.

```dts
function get<T>(store: Readable<T>): T;
```

### readonly
Convert any store to read-only.

```dts
function readonly<T>(store: Readable<T>): Readable<T>;
```

### toStore
Convert getter/setter to store.

```dts
function toStore<V>(get: () => V, set: (v: V) => void): Writable<V>;
function toStore<V>(get: () => V): Readable<V>;
```

### fromStore
Convert store to reactive object.

```dts
function fromStore<V>(store: Writable<V>): { current: V };
function fromStore<V>(store: Readable<V>): { readonly current: V };
```

## Interfaces & Types

### Readable
```dts
interface Readable<T> {
	subscribe(run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
}
```

### Writable
```dts
interface Writable<T> extends Readable<T> {
	set(value: T): void;
	update(updater: Updater<T>): void;
}
```

### Types
```dts
type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;
type Updater<T> = (value: T) => T;
type StartStopNotifier<T> = (
	set: (value: T) => void,
	update: (fn: Updater<T>) => void
) => void | (() => void);
```