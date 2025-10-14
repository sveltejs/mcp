# $service-worker

```js
import { base, build, files, prerendered, version } from '$service-worker';
```

Only available to [service workers](/docs/kit/service-workers).

## base

```ts
const base: string;
```

Base path of deployment. Equivalent to `config.kit.paths.base`, calculated from `location.pathname`. Works correctly in subdirectories.

Note: No `assets` export since service workers can't be used if `config.kit.paths.assets` is specified.

## build

```ts
const build: string[];
```

Array of URLs for Vite-generated files. Use with `cache.addAll(build)`. Empty during development.

## files

```ts
const files: string[];
```

Array of URLs from static directory (`config.kit.files.assets`). Customize via [`config.kit.serviceWorker.files`](/docs/kit/configuration#serviceWorker).

## prerendered

```ts
const prerendered: string[];
```

Array of prerendered page/endpoint pathnames. Empty during development.

## version

```ts
const version: string;
```

From [`config.kit.version`](/docs/kit/configuration#version). Use for unique cache names to invalidate old caches on deployment.