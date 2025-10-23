# $app/environment

```js
import { browser, building, dev, version } from '$app/environment';
```

## browser
`true` if app is running in the browser.

```dts
const browser: boolean;
```

## building
`true` during the build step and prerendering.

```dts
const building: boolean;
```

## dev
Whether dev server is running. Not guaranteed to match `NODE_ENV` or `MODE`.

```dts
const dev: boolean;
```

## version
The value of `config.kit.version.name`.

```dts
const version: string;
```