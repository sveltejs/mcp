# @sveltejs/mcp

Repo for the official Svelte MCP server.

## Dev setup instructions

```
pnpm i
cp apps/mcp-remote/.env.example apps/mcp-remote/.env
pnpm dev
```

1. Set the VOYAGE_API_KEY for embeddings support

> [!NOTE]
> Currently to prevent having a bunch of Timeout logs on vercel we shut down the SSE channel immediately. This means that we can't use `server.log` and we are not sending `list-changed` notifications. We can use elicitation and sampling since those are sent on the same stream of the POST request

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
