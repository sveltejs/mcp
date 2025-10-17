# $env/static/private

Server-only module for private environment variables loaded from `.env` files and `process.env`.

**Key characteristics:**
- Cannot be imported in client-side code
- Includes variables that do NOT begin with `config.kit.env.publicPrefix`
- Optionally filtered by `config.kit.env.privatePrefix`
- Values are **statically injected at build time** (enables dead code elimination)

## Usage

```ts
import { API_KEY } from '$env/static/private';
```

## Best practices

Declare all referenced env vars (even if empty) in `.env`:

```
MY_FEATURE_FLAG=""
```

Override from command line:

```sh
MY_FEATURE_FLAG="enabled" npm run dev
```