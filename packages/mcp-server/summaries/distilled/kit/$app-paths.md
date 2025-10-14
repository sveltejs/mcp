# $app/paths

```js
import { asset, assets, base, resolve, resolveRoute } from '$app/paths';
```

## asset

Resolve URL of an asset in `static` directory by prefixing with `config.kit.paths.assets` or base path.

During SSR, base path is relative and depends on current page.

```svelte
<script>
	import { asset } from '$app/paths';
</script>

<img alt="a potato" src={asset('/potato.jpg')} />
```

```dts
function asset(file: Asset): string;
```

## resolve

Resolve pathname by prefixing with base path, or resolve route ID by populating dynamic segments with parameters.

During SSR, base path is relative and depends on current page.

```js
// @errors: 7031
import { resolve } from '$app/paths';

// using a pathname
const resolved = resolve(`/blog/hello-world`);

// using a route ID plus parameters
const resolved = resolve('/blog/[slug]', {
	slug: 'hello-world'
});
```

```dts
function resolve<T extends RouteId | Pathname>(
	...args: ResolveArgs<T>
): ResolvedPathname;
```

## Deprecated

- **assets**: Use `asset(...)` instead. Absolute path matching `config.kit.paths.assets`.
- **base**: Use `resolve(...)` instead. String matching `config.kit.paths.base`.
- **resolveRoute**: Use `resolve(...)` instead.