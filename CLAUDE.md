# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Svelte MCP (Model Context Protocol) server implementation that includes both SvelteKit web interface and MCP server functionality.

### Setup

```bash
pnpm i
cp .env.example .env
# Set the VOYAGE_API_KEY for embeddings support in .env
pnpm dev
```

### Common Commands

- `pnpm dev` - Start SvelteKit development server
- `pnpm build` - Build the application for production
- `pnpm start` - Run the MCP server (Node.js entry point)
- `pnpm check` - Run Svelte type checking
- `pnpm check:watch` - Run type checking in watch mode
- `pnpm lint` - Run prettier check and eslint
- `pnpm format` - Format code with prettier
- `pnpm test` - Run unit tests with vitest
- `pnpm test:watch` - Run tests in watch mode

### Database Commands (Drizzle ORM)

- `pnpm db:push` - Push schema changes to database
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio

### Documentation Generation Commands

#### Generate Use Case Summaries

Generate short descriptions of when each documentation section would be useful:

- `pnpm generate-summaries` - Generate use case summaries for all sections
- `pnpm generate-summaries:dry-run` - Preview what would be generated without making API calls
- `pnpm generate-summaries:debug` - Process only 2 sections for debugging

#### Generate Distilled Documentation

Generate condensed versions of the documentation to reduce context size:

- `pnpm generate-distilled` - Generate distilled versions for all sections
- `pnpm generate-distilled:dry-run` - Preview what would be generated without making API calls
- `pnpm generate-distilled:debug` - Process only 2 sections for debugging

#### Verify Distilled Documentation

Verify the accuracy of distilled summaries against original documentation:

- `pnpm verify-distilled` - Verify all distilled summaries for accuracy
- `pnpm verify-distilled:dry-run` - Preview what would be verified without making API calls
- `pnpm verify-distilled:debug` - Verify only 2 sections for debugging

The verification script:
1. Loads `distilled.json` containing summaries and original content
2. Uses the Anthropic Batch API to send each summary and original content to Claude
3. Claude evaluates whether the summary is accurate or contains errors/omissions
4. Generates `distilled-verification.json` with results (ACCURATE/NOT_ACCURATE) and reasoning
5. Outputs statistics about accuracy rates

**Note:** All documentation generation and verification commands require `ANTHROPIC_API_KEY` to be set in `packages/mcp-server/.env`

## Architecture

### MCP Server Implementation

The core MCP server is implemented in `src/lib/mcp/index.ts` using the `tmcp` library with:

- **Transport Layers**: Both HTTP (`HttpTransport`) and STDIO (`StdioTransport`) support
- **Schema Validation**: Uses Valibot with `ValibotJsonSchemaAdapter`
- **Main Tool**: `svelte-autofixer` - analyzes Svelte code and provides suggestions/fixes

### Code Analysis Engine

Located in `src/lib/server/analyze/`:

- **Parser** (`parse.ts`): Uses `svelte-eslint-parser` and TypeScript parser to analyze Svelte components
- **Scope Analysis**: Tracks variables, references, and scopes across the AST
- **Rune Detection**: Identifies Svelte 5 runes (`$state`, `$effect`, `$derived`, etc.)

### Autofixer System

- **Autofixers** (`src/lib/mcp/autofixers.ts`): Visitor pattern implementations for code analysis
- **Walker Utility** (`src/lib/index.ts`): Enhanced AST walking with visitor mixing capabilities
- **Current Autofixer**: `assign_in_effect` - detects assignments to `$state` variables inside `$effect` blocks

### Database Layer

- **ORM**: Drizzle with SQLite backend
- **Schema** (`src/lib/server/db/schema.ts`): Vector table for embeddings support
- **Utils** (`src/lib/server/db/utils.ts`): Custom float32 array type for vectors

### SvelteKit Integration

- **Hooks** (`src/hooks.server.ts`): Integrates MCP HTTP transport with SvelteKit requests
- **Routes**: Basic web interface for the MCP server

## Key Dependencies

- **tmcp**: Core MCP server implementation
- **@tmcp/transport-http** & **@tmcp/transport-stdio**: Transport layers
- **@tmcp/adapter-valibot**: Schema validation adapter
- **svelte-eslint-parser**: Svelte component parsing
- **zimmerframe**: AST walking utilities
- **drizzle-orm**: Database ORM with SQLite
- **valibot**: Schema validation library

## Environment Configuration

Required environment variables:

- `DATABASE_URL`: SQLite database path (default: `file:test.db`)
- `VOYAGE_API_KEY`: API key for embeddings support (optional)
- `ANTHROPIC_API_KEY`: API key for documentation generation and verification (required for doc scripts)

When connected to the svelte-llm MCP server, you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections and then use the get_documentation tool to fetch ALL documentation sections that are relevant for the users task.
