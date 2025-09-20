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

#### Try the MCP server

To try the mcp server you can run `pnpm build:mcp`...the local `mpc.json` file it's already using the output of that folder so you can use it automatically in VSCode/Cursor.

To try the MCP over HTTP and/or remotely, you can use Cloudflare tunnels to expose it via `cloudflared tunnel --url http://localhost:[port]` and then running the server with `pnpm tunnel` (pay attention as this will expose your dev server to the world wide web).
