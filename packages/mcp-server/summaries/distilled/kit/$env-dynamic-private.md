# $env/dynamic/private

Access to runtime environment variables from the platform (e.g., `process.env` in adapter-node).

**Rules:**
- Only includes variables that do NOT start with `config.kit.env.publicPrefix`
- Only includes variables that DO start with `config.kit.env.privatePrefix` (if configured)
- **Cannot be imported in client-side code**

```ts
import { env } from '$env/dynamic/private';
console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
```

**Note:** In dev, always includes `.env` variables. In prod, depends on adapter.