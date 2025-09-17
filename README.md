# @sveltejs/mcp

Repo for the official Svelte MCP server.

## Dev setup instructions

```
pnpm i
cp .env.example .env
pnpm dev
```

1. Set the VOYAGE_API_KEY for embeddings support

### Local dev tools

#### MCP inspector

```
pnpm run inspect
```

Then visit http://localhost:6274/

- Transport type: `Streamable HTTP`
- http://localhost:5173/mcp

#### Database inspector

```
pnpm run db:studio
```

https://local.drizzle.studio/
