# $env/static/public

Environment variables with `PUBLIC_` prefix (configurable via `config.kit.env.publicPrefix`). Safe for client-side code. Values replaced at build time.

```ts
import { PUBLIC_BASE_URL } from '$env/static/public';
```