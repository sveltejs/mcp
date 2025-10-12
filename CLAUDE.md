# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing the official Svelte MCP (Model Context Protocol) server implementation with multiple packages:

- **`packages/mcp-server/`** - Core MCP server logic with tools, prompts, and autofixers
- **`packages/mcp-stdio/`** - CLI wrapper for running MCP server via stdio transport (`@sveltejs/mcp` on npm)
- **`packages/mcp-schema/`** - Shared database schema definitions using Drizzle ORM
- **`apps/mcp-remote/`** - SvelteKit web application for remote HTTP MCP access and documentation comparison

## Development Commands

### Setup

```bash
pnpm i
cp apps/mcp-remote/.env.example apps/mcp-remote/.env
# Set DATABASE_URL, DATABASE_TOKEN, and VOYAGE_API_KEY (optional) in apps/mcp-remote/.env
pnpm dev
```

### Common Commands

- `pnpm dev` - Start SvelteKit development server (apps/mcp-remote)
- `pnpm build` - Build all packages
- `pnpm check` - Run type checking across all packages
- `pnpm lint` - Run prettier check and eslint
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with prettier
- `pnpm test` - Run unit tests with vitest
- `pnpm test:watch` - Run tests in watch mode

### Database Commands (apps/mcp-remote)

- `pnpm db:push` - Push schema changes to Turso database
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio

### Documentation Generation Commands (packages/mcp-server)

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
- `pnpm show-verification-errors` - Display all sections that failed verification

The verification workflow:

1. Run `pnpm verify-distilled` to verify all distilled summaries
   - Loads `distilled.json` containing summaries and original content
   - Uses the Anthropic Batch API to send each summary and original content to Claude
   - Claude evaluates whether the summary is accurate or contains errors/omissions
   - Generates `distilled-verification.json` with results (ACCURATE/NOT_ACCURATE) and reasoning
   - Outputs statistics about accuracy rates
2. Run `pnpm show-verification-errors` to see detailed list of all sections that are NOT_ACCURATE
   - Displays each problematic section with its reasoning
   - Shows summary statistics

**Note:** All documentation generation and verification commands require `ANTHROPIC_API_KEY` to be set in `packages/mcp-server/.env`

### Documentation Updates

- `pnpm generate-prompt-docs` - Update documentation/docs/30-capabilities/30-prompts.md based on prompt handlers

### Publishing Commands

- `pnpm release` - Build and publish to npm using changesets
- `pnpm changeset:version` - Update versions and sync package.json with server.json

### Development Tools

- `pnpm inspect` - Launch MCP inspector at http://localhost:6274/ for testing tools and prompts

## Architecture

### MCP Server Implementation (`packages/mcp-server/src/mcp/`)

The core MCP server is implemented using the `tmcp` library with:

- **Transport Layers**: Both HTTP (`@tmcp/transport-http`) and STDIO (`@tmcp/transport-stdio`) support
- **Schema Validation**: Uses Valibot with `ValibotJsonSchemaAdapter`
- **Server Definition**: `packages/mcp-server/src/mcp/index.ts` exports the configured server instance

### MCP Tools (`packages/mcp-server/src/mcp/handlers/tools/`)

#### get-documentation

Retrieves documentation content for Svelte 5 or SvelteKit sections. Supports:
- Single or multiple section names
- Search by title (e.g., "$state") or file path (e.g., "cli/overview")
- Optional distilled versions to optimize context size (default: true)
- Automatically loads distilled content from `distilled.json` when available

#### list-sections

Lists all available Svelte 5 and SvelteKit documentation sections with:
- Section titles and file paths
- "use_cases" metadata describing when each section is useful
- Helps LLMs determine which documentation to fetch

#### svelte-autofixer

Analyzes Svelte component or module code and returns suggestions/fixes:
- Runs compilation checks
- Runs ESLint checks
- Runs custom autofixer visitors
- Requires `code`, `desired_svelte_version` (4 or 5), and optional `filename`
- Returns issues, suggestions, and whether another tool call is needed

#### playground-link

Generates a Svelte Playground link from code snippets:
- Accepts multiple files (must include `App.svelte` as entry point)
- Optional Tailwind CSS support
- Compresses and encodes files into URL hash

### MCP Prompts (`packages/mcp-server/src/mcp/handlers/prompts/`)

#### svelte-task

A prompt template that instructs LLMs on how to:
- Query available documentation sections
- Use the autofixer iteratively until no issues remain
- Generate playground links when appropriate
- Follows best practices for Svelte development

Prompts are defined with:
- `generate_for_docs()` - Function to generate prompt text for documentation
- `docs_description` - Human-readable description
- Prompt handler - Server registration logic with schema and completions

### MCP Resources (`packages/mcp-server/src/mcp/handlers/resources/`)

#### Svelte-Doc-Section

URI template: `svelte://{/slug*}.md`

Lists and fetches individual documentation sections:
- Lists all sections with metadata (title, use_cases, URI)
- Provides completions for slug parameter
- Fetches content from svelte.dev/docs/

### Code Analysis & Parsing (`packages/mcp-server/src/parse/`)

- **Parser** (`parse.ts`): Uses `svelte-eslint-parser` and TypeScript parser
- **Scope Analysis**: Tracks variables, references, and scopes across the AST
- **Rune Detection**: Identifies Svelte 5 runes (`$state`, `$effect`, `$derived`, etc.)

### Autofixer System (`packages/mcp-server/src/mcp/autofixers/`)

The autofixer system uses a visitor pattern to analyze Svelte components:

#### Core Autofixer Files

- **`add-compile-issues.ts`** - Runs Svelte compiler and adds compilation errors
- **`add-eslint-issues.ts`** - Runs ESLint with svelte-eslint-parser
- **`add-autofixers-issues.ts`** - Orchestrates all custom autofixer visitors

#### AST Walking (`ast/`)

- **`walk.ts`** - Enhanced AST walking with visitor mixing capabilities using zimmerframe
- **`utils.ts`** - Utility functions for AST manipulation

#### Autofixer Visitors (`visitors/`)

Each visitor checks for specific issues:

- **`assign-in-effect.ts`** - Detects assignments to `$state` variables inside `$effect` blocks
- **`derived-with-function.ts`** - Suggests using `$derived.by()` when passing a function to `$derived()`
- **`imported-runes.ts`** - Detects attempts to import runes (they're globals)
- **`read-state-with-dollar.ts`** - Detects reading `$state` variables with `$` prefix in Svelte 5
- **`suggest-attachments.ts`** - Suggests attachments API for bind:this and actions
- **`use-runes-instead-of-store.ts`** - Suggests migrating from stores to runes in Svelte 5
- **`wrong-property-access-state.ts`** - Detects incorrect property access patterns on `$state` variables

### Database Layer (`packages/mcp-schema/`)

- **ORM**: Drizzle with LibSQL/Turso backend
- **Schema** (`src/schema.js`): 
  - `content` - Original documentation with embeddings
  - `content_distilled` - Distilled/condensed documentation with embeddings
  - `distillations` - Stored distilled documentation versions
  - `distillation_jobs` - Batch processing job tracking
- **Utils** (`src/utils.js`): Custom `float_32_array` type for vector embeddings

### SvelteKit Web App (`apps/mcp-remote/`)

Remote HTTP MCP server with documentation comparison interface:

- **Hooks** (`src/hooks.server.ts`): Integrates MCP HTTP transport with SvelteKit requests
- **Routes**: 
  - `/` - Landing page
  - `/compare/use_cases` - Compare use case summaries with original docs
  - `/compare/distilled` - Compare distilled docs with original docs
- **MCP Setup** (`src/lib/mcp/index.ts`): HTTP transport configuration

### CLI Package (`packages/mcp-stdio/`)

Standalone npm package (`@sveltejs/mcp`) that:
- Runs the MCP server via stdio transport
- Built with tsdown for optimal bundling
- Externalizes `eslint` dependency (required at runtime)
- Published to npm registry and MCP registry

## Key Dependencies

- **tmcp**: Core MCP server implementation
- **@tmcp/transport-http** & **@tmcp/transport-stdio**: Transport layers
- **@tmcp/adapter-valibot**: Schema validation adapter
- **svelte-eslint-parser**: Svelte component parsing
- **typescript-eslint**: TypeScript AST parsing
- **zimmerframe**: AST walking utilities
- **drizzle-orm**: Database ORM with LibSQL
- **valibot**: Schema validation library
- **@anthropic-ai/sdk**: Anthropic Batch API for documentation processing
- **tsdown**: TypeScript bundler for CLI package

## Environment Configuration

### apps/mcp-remote/.env

Required for the remote MCP server:

- `DATABASE_URL`: LibSQL/Turso database URL (e.g., `libsql://db-name.turso.io`)
- `DATABASE_TOKEN`: Turso authentication token
- `VOYAGE_API_KEY`: API key for embeddings support (optional, for vector search features)

### packages/mcp-server/.env

Required for documentation generation scripts:

- `ANTHROPIC_API_KEY`: API key for generating and verifying distilled documentation

## Using the MCP Server

### Available MCP Tools

1. **list-sections** - ALWAYS call this FIRST to discover available documentation
   - Returns structured list with titles, paths, and use_cases metadata
   - Use the use_cases field to determine relevant sections

2. **get-documentation** - Retrieves documentation content
   - Accepts single section name or array of section names
   - Searches by title or file path
   - Optional `use_distilled` parameter (default: true) for condensed versions
   - After calling list-sections, fetch ALL relevant sections at once

3. **svelte-autofixer** - Analyzes Svelte code
   - MUST be used whenever writing Svelte code before returning to user
   - Keep calling until no issues/suggestions remain
   - Provides compilation errors, ESLint issues, and custom suggestions

4. **playground-link** - Generates Svelte Playground URLs
   - Only use after code is finalized and user confirms
   - Requires App.svelte as entry point
   - Can include multiple files

### Available MCP Prompts

- **svelte-task** - Use for any Svelte-related task
  - Instructs LLM on proper tool usage
  - Enforces iterative autofixer workflow
  - Guides documentation querying

## Constants & Configuration

### Svelte Runes (`packages/mcp-server/src/constants.ts`)

Base runes:
- `$state`, `$effect`, `$derived`, `$inspect`, `$props`, `$bindable`, `$host`

Nested runes:
- `$state.raw`, `$state.snapshot`, `$effect.pre`, `$effect.tracking`, `$effect.pending`, `$effect.root`, `$derived.by`, `$inspect.trace`, `$props.id`

## Code Style & Standards

- **Naming**: Use `snake_case` for variables and functions
- **Types**: Prefer TypeScript type imports with JSDoc where needed
- **Formatting**: Tabs for indentation, single quotes, trailing commas
- **File Extensions**: Include `.js` extension in imports even for TypeScript files
- **Linting**: Run `pnpm lint:fix` before committing

## Testing

- Unit tests use Vitest
- Test files use `.test.ts` or `.spec.ts` suffix
- Run `pnpm test` to execute all tests
- Run `pnpm test:watch` for watch mode
- Test coverage includes:
  - Documentation generation and verification
  - Autofixer visitors
  - Parsing and AST analysis
