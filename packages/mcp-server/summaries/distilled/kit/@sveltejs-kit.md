# @sveltejs/kit Server APIs

## Core Functions

### error
Throws HTTP error with status code and optional message. Stops request handling and returns error response.

```ts
function error(status: number, body: App.Error): never;
function error(status: number, body?: { message: string }): never;
```

**Important**: Don't catch the thrown error - it prevents SvelteKit from handling it.

### redirect
Redirects a request. Common status codes:
- `303`: GET redirect (often after form POST)
- `307`: Temporary redirect (keeps method)
- `308`: Permanent redirect (keeps method, SEO transfer)

```ts
function redirect(
  status: 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308,
  location: string | URL
): never;
```

**Important**: Don't catch the thrown redirect.

### fail
Creates `ActionFailure` for failed form submissions.

```ts
function fail(status: number): ActionFailure<undefined>;
function fail<T>(status: number, data: T): ActionFailure<T>;
```

### json / text
Create Response objects:

```ts
function json(data: any, init?: ResponseInit): Response;
function text(body: string, init?: ResponseInit): Response;
```

### normalizeUrl
Strips SvelteKit-internal suffixes and trailing slashes. Available since 2.18.0.

```ts
const { url, denormalize } = normalizeUrl('/blog/post/__data.json');
console.log(url.pathname); // /blog/post
console.log(denormalize('/blog/post/a')); // /blog/post/a/__data.json
```

## Type Checkers

```ts
function isActionFailure(e: unknown): e is ActionFailure;
function isHttpError(e: unknown, status?: number): e is HttpError;
function isRedirect(e: unknown): e is Redirect;
```

## Server Class

```ts
class Server {
  constructor(manifest: SSRManifest);
  init(options: ServerInitOptions): Promise<void>;
  respond(request: Request, options: RequestOptions): Promise<Response>;
}
```

## Hooks

### Handle
Runs on every request. Receives `event` and `resolve` function.

```ts
type Handle = (input: {
  event: RequestEvent;
  resolve: (event: RequestEvent, opts?: ResolveOptions) => MaybePromise<Response>;
}) => MaybePromise<Response>;
```

### HandleFetch
Modifies `event.fetch()` calls on server/during prerendering.

```ts
type HandleFetch = (input: {
  event: RequestEvent;
  request: Request;
  fetch: typeof fetch;
}) => MaybePromise<Response>;
```

### HandleError

**Client-side**: Runs on unexpected navigation errors. Must never throw.

```ts
type HandleClientError = (input: {
  error: unknown;
  event: NavigationEvent;
  status: number;
  message: string;
}) => MaybePromise<void | App.Error>;
```

**Server-side**: Runs on unexpected request errors. Must never throw.

```ts
type HandleServerError = (input: {
  error: unknown;
  event: RequestEvent;
  status: number;
  message: string;
}) => MaybePromise<void | App.Error>;
```

### HandleValidationError
Runs when remote function argument validation fails.

```ts
type HandleValidationError = (input: {
  issues: StandardSchemaV1.Issue[];
  event: RequestEvent;
}) => MaybePromise<App.Error>;
```

### Reroute
Modifies URL before route determination. Available since 2.3.0.

```ts
type Reroute = (event: {
  url: URL;
  fetch: typeof fetch;
}) => MaybePromise<void | string>;
```

### Init Hooks
Available since 2.10.0.

```ts
type ClientInit = () => MaybePromise<void>; // Runs when app starts in browser
type ServerInit = () => MaybePromise<void>; // Runs before first request
```

### Transport
Custom type serialization across server/client. Available since 2.11.0.

```ts
type Transport = Record<string, Transporter>;

interface Transporter<T, U> {
  encode: (value: T) => false | U;
  decode: (data: U) => T;
}
```

## RequestEvent

Core event object for server-side code:

```ts
interface RequestEvent<Params, RouteId> {
  cookies: Cookies;
  fetch: typeof fetch; // Enhanced with cookie/auth inheritance, relative URLs, direct internal calls
  getClientAddress: () => string;
  locals: App.Locals;
  params: Params;
  platform: App.Platform | undefined;
  request: Request;
  route: { id: RouteId };
  setHeaders: (headers: Record<string, string>) => void;
  url: URL;
  isDataRequest: boolean; // True for +page/layout.server.js data requests
  isSubRequest: boolean; // True for same-origin fetch without HTTP overhead
  isRemoteRequest: boolean; // True for remote function calls
  tracing: { enabled: boolean; root: Span; current: Span }; // Since 2.31.0
}
```

## Cookies

```ts
interface Cookies {
  get(name: string, opts?: CookieParseOptions): string | undefined;
  getAll(opts?: CookieParseOptions): Array<{ name: string; value: string }>;
  set(name: string, value: string, opts: CookieSerializeOptions & { path: string }): void;
  delete(name: string, opts: CookieSerializeOptions & { path: string }): void;
  serialize(name: string, value: string, opts: CookieSerializeOptions & { path: string }): string;
}
```

**Defaults**: `httpOnly` and `secure` are `true` (except on http://localhost). `sameSite` defaults to `lax`.

**Important**: Must specify `path` (usually `path: '/'`). Can't set `set-cookie` via `setHeaders` - use `cookies` API in server-only `load`.

## Load Functions

### LoadEvent (Client/Universal)

```ts
interface LoadEvent<Params, Data, ParentData, RouteId> {
  fetch: typeof fetch; // Enhanced with cookie inheritance, relative URLs, inlining
  data: Data; // From server load
  params: Params;
  route: { id: RouteId };
  url: URL;
  setHeaders: (headers: Record<string, string>) => void; // No effect in browser
  parent: () => Promise<ParentData>;
  depends: (...deps: Array<`${string}:${string}`>) => void;
  untrack: <T>(fn: () => T) => T;
  tracing: { enabled: boolean; root: Span; current: Span }; // Since 2.31.0
}
```

### ServerLoadEvent

Extends `RequestEvent` with:

```ts
interface ServerLoadEvent<Params, ParentData, RouteId> extends RequestEvent<Params, RouteId> {
  parent: () => Promise<ParentData>;
  depends: (...deps: string[]) => void;
  untrack: <T>(fn: () => T) => T;
  tracing: { enabled: boolean; root: Span; current: Span }; // Since 2.31.0
}
```

**Gotcha**: Call `parent()` after fetching other data to avoid waterfalls.

## Actions

### Action Type

```ts
type Action<Params, OutputData, RouteId> = (
  event: RequestEvent<Params, RouteId>
) => MaybePromise<OutputData>;

type Actions<Params, OutputData, RouteId> = Record<string, Action<Params, OutputData, RouteId>>;
```

### ActionResult

```ts
type ActionResult<Success, Failure> =
  | { type: 'success'; status: number; data?: Success }
  | { type: 'failure'; status: number; data?: Failure }
  | { type: 'redirect'; status: number; location: string }
  | { type: 'error'; status?: number; error: any };
```

### SubmitFunction

```ts
type SubmitFunction<Success, Failure> = (input: {
  action: URL;
  formData: FormData;
  formElement: HTMLFormElement;
  controller: AbortController;
  submitter: HTMLElement | null;
  cancel: () => void;
}) => MaybePromise<void | ((opts: {
  formData: FormData;
  formElement: HTMLFormElement;
  action: URL;
  result: ActionResult<Success, Failure>;
  update: (options?: { reset?: boolean; invalidateAll?: boolean }) => Promise<void>;
}) => MaybePromise<void>)>;
```

## Remote Functions

### RemoteQuery

```ts
type RemoteQuery<T> = RemoteResource<T> & {
  set(value: T): void;
  refresh(): Promise<void>;
  withOverride(update: (current: Awaited<T>) => Awaited<T>): RemoteQueryOverride;
};

type RemoteQueryFunction<Input, Output> = (arg: Input) => RemoteQuery<Output>;
```

### RemoteCommand

```ts
type RemoteCommand<Input, Output> = {
  (arg: Input): Promise<Awaited<Output>> & {
    updates(...queries: Array<RemoteQuery<any> | RemoteQueryOverride>): Promise<Awaited<Output>>;
  };
  get pending(): number;
};
```

### RemoteForm

```ts
type RemoteForm<Input, Output> = {
  [attachment: symbol]: (node: HTMLFormElement) => void;
  method: 'POST';
  action: string;
  enhance(callback: (opts: { form: HTMLFormElement; data: Input; submit: () => Promise<void> }) => void): { ... };
  for(id: ExtractId<Input>): Omit<RemoteForm<Input, Output>, 'for'>;
  preflight(schema: StandardSchemaV1<Input, any>): RemoteForm<Input, Output>;
  validate(options?: { includeUntouched?: boolean; submitter?: HTMLButtonElement }): Promise<void>;
  get result(): Output | undefined;
  get pending(): number;
  fields: RemoteFormFields<Input>;
  buttonProps: { ... };
};
```

### RemotePrerenderFunction

```ts
type RemotePrerenderFunction<Input, Output> = (arg: Input) => RemoteResource<Output>;
```

### RemoteResource

```ts
type RemoteResource<T> = Promise<Awaited<T>> & {
  get error(): any;
  get loading(): boolean;
} & ({ get current(): undefined; ready: false } | { get current(): Awaited<T>; ready: true });
```

## Navigation Types

### NavigationType

```ts
type NavigationType = 'enter' | 'form' | 'leave' | 'link' | 'goto' | 'popstate';
```

### AfterNavigate

```ts
type AfterNavigate = (Navigation | NavigationEnter) & {
  type: Exclude<NavigationType, 'leave'>;
  willUnload: false;
};
```

### BeforeNavigate

```ts
type BeforeNavigate = Navigation & {
  cancel: () => void;
};
```

### OnNavigate

```ts
type OnNavigate = Navigation & {
  type: Exclude<NavigationType, 'enter' | 'leave'>;
  willUnload: false;
};
```

## Page

```ts
interface Page<Params, RouteId> {
  url: URL & { pathname: ResolvedPathname };
  params: Params;
  route: { id: RouteId };
  status: number;
  error: App.Error | null;
  data: App.PageData & Record<string, any>;
  state: App.PageState;
  form: any; // Filled after form submission
}
```

## Adapter

```ts
interface Adapter {
  name: string;
  adapt: (builder: Builder) => MaybePromise<void>;
  supports?: {
    read?: (details: { config: any; route: { id: string } }) => boolean;
    instrumentation?: () => boolean; // Since 2.31.0
  };
  emulate?: () => MaybePromise<Emulator>;
}
```

### Builder

Key methods:
- `writeClient(dest: string): string[]`
- `writeServer(dest: string): string[]`
- `writePrerendered(dest: string): string[]`
- `generateManifest(opts: { relativePath: string; routes?: RouteDefinition[] }): string`
- `compress(directory: string): Promise<void>`
- `instrument(args: { entrypoint: string; instrumentation: string; ... }): void` (Since 2.31.0)

## Snapshot

```ts
interface Snapshot<T> {
  capture: () => T;
  restore: (snapshot: T) => void;
}
```

## Constants

```ts
const VERSION: string; // SvelteKit version
```