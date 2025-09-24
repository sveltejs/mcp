# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a pnpm monorepo containing Svelte MCP (Model Context Protocol) server implementations across multiple packages and applications:

- **apps/mcp-remote**: SvelteKit web application with MCP server functionality
- **packages/mcp-server**: Core MCP server implementation with code analysis tools
- **packages/mcp-stdio**: Standalone MCP server CLI with STDIO transport
- **packages/mcp-schema**: Shared schema definitions and database utilities

## Development Commands

### Setup

```bash
pnpm i
cp apps/mcp-remote/.env.example apps/mcp-remote/.env
# Set the VOYAGE_API_KEY for embeddings support in .env
```

### Starting the mcp-remote app in dev mode

```bash
# Start the SvelteKit development server for mcp-remote
cd apps/mcp-remote
pnpm dev
```

Or from the root:

```bash
# Run dev command for all workspaces
pnpm dev
```

### Common Commands (from root)

- `pnpm build` - Build all packages and applications
- `pnpm check` - Run type checking across all packages
- `pnpm lint` - Run prettier check and eslint across all packages
- `pnpm format` - Format code with prettier across all packages
- `pnpm test` - Run unit tests across all packages
- `pnpm test:watch` - Run tests in watch mode

### mcp-remote App Commands

Navigate to `apps/mcp-remote/` to run these commands:

- `pnpm dev` - Start SvelteKit development server
- `pnpm build` - Build the SvelteKit application for production
- `pnpm build:mcp` - Build the MCP server TypeScript files
- `pnpm start` - Run the MCP server (Node.js entry point)
- `pnpm check` - Run Svelte type checking
- `pnpm check:watch` - Run type checking in watch mode
- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm inspect` - Start MCP inspector at http://localhost:6274/

### MCP Inspector Usage

After running `pnpm inspect`, visit http://localhost:6274/:
- Transport type: `Streamable HTTP`
- URL: http://localhost:5173/mcp (when dev server is running)

## Architecture

### Monorepo Package Structure

- **@sveltejs/mcp-remote**: Full SvelteKit application with web interface and MCP server
- **@sveltejs/mcp-server**: Core MCP server logic and code analysis engine (private workspace package)
- **@sveltejs/mcp**: Standalone CLI MCP server with STDIO transport (publishable)
- **@sveltejs/mcp-schema**: Shared database schema and utilities (private workspace package)

### mcp-remote App (apps/mcp-remote)

The main SvelteKit application that provides both web interface and MCP server functionality:

- **Entry Point**: `src/index.js` for Node.js MCP server
- **SvelteKit Integration**: `src/hooks.server.ts` integrates MCP HTTP transport with SvelteKit requests
- **MCP Server**: `src/lib/mcp/index.ts` - HTTP and STDIO transport support
- **Database**: SQLite with Drizzle ORM, vector storage for embeddings
- **Content Sync**: `src/lib/server/contentSync.ts` and `src/lib/server/contentDb.ts` for content management

### mcp-server Package (packages/mcp-server)

Core MCP server implementation shared across applications:

- **Main Export**: `src/index.ts`
- **MCP Implementation**: `src/mcp/index.ts` using `tmcp` library with Valibot schema validation
- **Code Analysis**: Svelte component parsing with `svelte-eslint-parser` and TypeScript parser
- **Autofixers**: Visitor pattern implementations for code analysis and suggestions
- **Tools**: `svelte-autofixer` - analyzes Svelte code and provides suggestions/fixes

### mcp-stdio Package (packages/mcp-stdio)

Standalone publishable MCP server with STDIO transport:

- **CLI Binary**: `svelte-mcp` command
- **Entry Point**: `src/index.ts`
- **Transport**: Uses `@tmcp/transport-stdio` for command-line integration

### Database Layer (mcp-remote)

- **ORM**: Drizzle with SQLite backend (`test.db`)
- **Schema**: Located in `src/lib/server/db/schema.ts` with vector table for embeddings
- **Configuration**: `drizzle.config.ts` in mcp-remote app

## Key Dependencies

- **tmcp**: Core MCP server implementation
- **@tmcp/transport-http** & **@tmcp/transport-stdio**: Transport layers
- **@tmcp/adapter-valibot**: Schema validation adapter
- **svelte-eslint-parser**: Svelte component parsing
- **zimmerframe**: AST walking utilities
- **drizzle-orm**: Database ORM with SQLite
- **valibot**: Schema validation library

## Environment Configuration

For the mcp-remote app (`apps/mcp-remote/.env`):

- `DATABASE_URL`: SQLite database path (default: `file:test.db`)
- `VOYAGE_API_KEY`: API key for embeddings support (optional)

When connected to the svelte-llm MCP server, you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list_sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get_documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list_sections tool, you MUST analyze the returned documentation sections and then use the get_documentation tool to fetch ALL documentation sections that are relevant for the users task.
