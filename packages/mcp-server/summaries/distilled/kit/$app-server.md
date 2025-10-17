# $app/server

```js
import {
	command,
	form,
	getRequestEvent,
	prerender,
	query,
	read
} from '$app/server';
```

## command
*Available since 2.27*

Creates a remote command. When called from browser, invokes function on server via `fetch`.

```dts
function command<Output>(fn: () => Output): RemoteCommand<void, Output>;

function command<Input, Output>(
	validate: 'unchecked',
	fn: (arg: Input) => Output
): RemoteCommand<Input, Output>;

function command<Schema extends StandardSchemaV1, Output>(
	validate: Schema,
	fn: (arg: StandardSchemaV1.InferOutput<Schema>) => Output
): RemoteCommand<StandardSchemaV1.InferInput<Schema>, Output>;
```

See [Remote functions](/docs/kit/remote-functions#command).

## form
*Available since 2.27*

Creates a form object that can be spread onto a `<form>` element.

```dts
function form<Output>(
	fn: (invalid: Invalid<void>) => MaybePromise<Output>
): RemoteForm<void, Output>;

function form<Input extends RemoteFormInput, Output>(
	validate: 'unchecked',
	fn: (data: Input, invalid: Invalid<Input>) => MaybePromise<Output>
): RemoteForm<Input, Output>;

function form<Schema extends StandardSchemaV1<RemoteFormInput, Record<string, any>>, Output>(
	validate: Schema,
	fn: (data: StandardSchemaV1.InferOutput<Schema>, invalid: Invalid<StandardSchemaV1.InferOutput<Schema>>) => MaybePromise<Output>
): RemoteForm<StandardSchemaV1.InferInput<Schema>, Output>;
```

See [Remote functions](/docs/kit/remote-functions#form).

## getRequestEvent
*Available since 2.20.0*

Returns current `RequestEvent`. Use in server hooks, server `load` functions, actions, and endpoints.

**Important:** In environments without `AsyncLocalStorage`, must be called synchronously (not after `await`).

```dts
function getRequestEvent(): RequestEvent;
```

## prerender
*Available since 2.27*

Creates a remote prerender function. When called from browser, invokes function on server via `fetch`.

```dts
function prerender<Output>(
	fn: () => MaybePromise<Output>,
	options?: { inputs?: RemotePrerenderInputsGenerator<void>; dynamic?: boolean; }
): RemotePrerenderFunction<void, Output>;

function prerender<Input, Output>(
	validate: 'unchecked',
	fn: (arg: Input) => MaybePromise<Output>,
	options?: { inputs?: RemotePrerenderInputsGenerator<Input>; dynamic?: boolean; }
): RemotePrerenderFunction<Input, Output>;

function prerender<Schema extends StandardSchemaV1, Output>(
	schema: Schema,
	fn: (arg: StandardSchemaV1.InferOutput<Schema>) => MaybePromise<Output>,
	options?: { inputs?: RemotePrerenderInputsGenerator<StandardSchemaV1.InferInput<Schema>>; dynamic?: boolean; }
): RemotePrerenderFunction<StandardSchemaV1.InferInput<Schema>, Output>;
```

See [Remote functions](/docs/kit/remote-functions#prerender).

## query
*Available since 2.27*

Creates a remote query. When called from browser, invokes function on server via `fetch`.

```dts
function query<Output>(fn: () => MaybePromise<Output>): RemoteQueryFunction<void, Output>;

function query<Input, Output>(
	validate: 'unchecked',
	fn: (arg: Input) => MaybePromise<Output>
): RemoteQueryFunction<Input, Output>;

function query<Schema extends StandardSchemaV1, Output>(
	schema: Schema,
	fn: (arg: StandardSchemaV1.InferOutput<Schema>) => MaybePromise<Output>
): RemoteQueryFunction<StandardSchemaV1.InferInput<Schema>, Output>;
```

### query.batch
*Available since 2.35*

Collects multiple calls and executes them in a single request.

```dts
function batch<Input, Output>(
	validate: 'unchecked',
	fn: (args: Input[]) => MaybePromise<(arg: Input, idx: number) => Output>
): RemoteQueryFunction<Input, Output>;

function batch<Schema extends StandardSchemaV1, Output>(
	schema: Schema,
	fn: (args: StandardSchemaV1.InferOutput<Schema>[]) => MaybePromise<(arg: StandardSchemaV1.InferOutput<Schema>, idx: number) => Output>
): RemoteQueryFunction<StandardSchemaV1.InferInput<Schema>, Output>;
```

See [Remote functions](/docs/kit/remote-functions#query) and [query.batch](/docs/kit/remote-functions#query.batch).

## read
*Available since 2.4.0*

Reads contents of an imported asset from filesystem.

```js
import { read } from '$app/server';
import somefile from './somefile.txt';

const asset = read(somefile);
const text = await asset.text();
```

```dts
function read(asset: string): Response;
```