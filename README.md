# @sveltejs/mcp

Repo for the official Svelte MCP server.

## Dev setup instructions

```
pnpm i
cp .env.example .env
pnpm dev
```

1. Set the VOYAGE_API_KEY for embeddings support

#### Optional tools

```
docker-compose up
```

- MCP Inspector: http://localhost:6274/ (Connect with `http://host.docker.internal:5173/mcp` + Streamable HTTP)
- http://localhost:8081/ - SQLite frontend
