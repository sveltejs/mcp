# $env/dynamic/public

Runtime access to public environment variables (prefixed with `PUBLIC_` by default via `config.kit.env.publicPrefix`).

**Key differences:**
- Only includes variables with public prefix (safe for client-side)
- All public dynamic env vars sent server→client (increases network payload)
- **Prefer `$env/static/public`** when possible to avoid larger requests

```ts
import { env } from '$env/dynamic/public';
console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
```