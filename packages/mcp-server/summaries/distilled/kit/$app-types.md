# $app/types

Generated types for routes in your app (available since SvelteKit 2.26).

```js
import type { RouteId, RouteParams, LayoutParams } from '$app/types';
```

## Asset

Union of all filenames in `static` directory + wildcard for imported asset paths.

```dts
type Asset = '/favicon.png' | '/robots.txt' | (string & {});
```

## RouteId

Union of all route IDs. Used for `page.route.id` and `event.route.id`.

```dts
type RouteId = '/' | '/my-route' | '/my-other-route/[param]';
```

## Pathname

Union of all valid pathnames.

```dts
type Pathname = '/' | '/my-route' | `/my-other-route/${string}` & {};
```

## ResolvedPathname

Like `Pathname` but possibly prefixed with base path. Used for `page.url.pathname`.

```dts
type ResolvedPathname = `${'' | `/${string}`}/` | `${'' | `/${string}`}/my-route` | `${'' | `/${string}`}/my-other-route/${string}` | {};
```

## RouteParams

Get parameters for a route.

```ts
type BlogParams = RouteParams<'/blog/[slug]'>; // { slug: string }
```

```dts
type RouteParams<T extends RouteId> = { /* generated */ } | Record<string, never>;
```

## LayoutParams

Get parameters for a layout, including optional parameters from child routes.

```dts
type RouteParams<T extends RouteId> = { /* generated */ } | Record<string, never>;
```