> [!WARNING]
> Unfortunately i published the 1.0 by mistake...this package is currently under heavy development so there will be breaking changes in minors...threat this `1.x` as the `0.x` of any other package. Sorry for the disservice, every breaking will be properly labeled in the PR name.

# tmcp

A lightweight, schema-agnostic Model Context Protocol (MCP) server implementation with unified API design.

## Why tmcp?

tmcp offers significant advantages over the official MCP SDK:

- **🔄 Schema Agnostic**: Works with any validation library through adapters
- **📦 No Weird Dependencies**: Minimal footprint with only essential dependencies (looking at you `express`)
- **🎯 Unified API**: Consistent, intuitive interface across all MCP capabilities
- **🔌 Extensible**: Easy to add support for new schema libraries
- **⚡ Lightweight**: No bloat, just what you need

## Supported Schema Libraries

tmcp works with all major schema validation libraries through its adapter system:

- **Zod** - `@tmcp/adapter-zod`
- **Valibot** - `@tmcp/adapter-valibot`
- **ArkType** - `@tmcp/adapter-arktype`
- **Effect Schema** - `@tmcp/adapter-effect`
- **Zod v3** - `@tmcp/adapter-zod-v3`

## Installation

```bash
pnpm install tmcp
# Choose your preferred schema library adapter
pnpm install @tmcp/adapter-zod zod
# Choose your preferred transport
pnpm install @tmcp/transport-stdio  # For CLI/desktop apps
pnpm install @tmcp/transport-http   # For web-based clients
```

## Quick Start

### Standard I/O Transport (CLI/Desktop)

```javascript
import { McpServer } from 'tmcp';
import { ZodJsonSchemaAdapter } from '@tmcp/adapter-zod';
import { StdioTransport } from '@tmcp/transport-stdio';
import { z } from 'zod';

const adapter = new ZodJsonSchemaAdapter();
const server = new McpServer(
	{
		name: 'my-server',
		version: '1.0.0',
		description: 'My awesome MCP server',
	},
	{
		adapter,
		capabilities: {
			tools: { listChanged: true },
			prompts: { listChanged: true },
			resources: { listChanged: true },
		},
	},
);

// Define a tool with type-safe schema
server.tool(
	{
		name: 'calculate',
		description: 'Perform mathematical calculations',
		schema: z.object({
			operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
			a: z.number(),
			b: z.number(),
		}),
	},
	async ({ operation, a, b }) => {
		switch (operation) {
			case 'add':
				return a + b;
			case 'subtract':
				return a - b;
			case 'multiply':
				return a * b;
			case 'divide':
				return a / b;
		}
	},
);

// Start the server with stdio transport
const transport = new StdioTransport(server);
transport.listen();
```

### HTTP Transport (Web-based)

```javascript
import { McpServer } from 'tmcp';
import { ZodJsonSchemaAdapter } from '@tmcp/adapter-zod';
import { HttpTransport } from '@tmcp/transport-http';
import { z } from 'zod';

const adapter = new ZodJsonSchemaAdapter();
const server = new McpServer(/* ... same server config ... */);

// Add tools as above...

// Create HTTP transport
const transport = new HttpTransport(server);

// Use with your preferred HTTP server (Bun example)
Bun.serve({
	port: 3000,
	async fetch(req) {
		const response = await transport.respond(req);
		if (response === null) {
			return new Response('Not Found', { status: 404 });
		}
		return response;
	},
});
```

## API Reference

### McpServer

The main server class that handles MCP protocol communications.

#### Constructor

```javascript
new McpServer(serverInfo, options);
```

- `serverInfo`: Server metadata (name, version, description)
- `options`: Configuration object with adapter and capabilities

#### Methods

##### `tool(definition, handler)`

Register a tool with optional schema validation.

```javascript
server.tool(
	{
		name: 'tool-name',
		description: 'Tool description',
		schema: yourSchema, // optional
	},
	async (input) => {
		// Tool implementation
		return result;
	},
);
```

##### `prompt(definition, handler)`

Register a prompt template with optional schema validation.

```javascript
server.prompt(
  {
	name: 'prompt-name',
	description: 'Prompt description',
	schema: yourSchema, // optional
	complete: (arg, context) => ['completion1', 'completion2'] // optional
  },
  async (input) => {
	// Prompt implementation
	return { messages: [...] };
  }
);
```

##### `resource(definition, handler)`

Register a static resource.

```javascript
server.resource(
  {
	name: 'resource-name',
	description: 'Resource description',
	uri: 'file://path/to/resource'
  },
  async (uri, params) => {
	// Resource implementation
	return { contents: [...] };
  }
);
```

##### `template(definition, handler)`

Register a URI template for dynamic resources.

```javascript
server.template(
  {
	name: 'template-name',
	description: 'Template description',
	uri: 'file://path/{id}/resource',
	complete: (arg, context) => ['id1', 'id2'] // optional
  },
  async (uri, params) => {
	// Template implementation using params.id
	return { contents: [...] };
  }
);
```

##### `receive(request)`

Process an incoming MCP request.

```javascript
const response = server.receive(jsonRpcRequest);
```

## Advanced Examples

### Multiple Schema Libraries

```javascript
// Use different schemas for different tools
import { z } from 'zod';
import * as v from 'valibot';

server.tool(
	{
		name: 'zod-tool',
		schema: z.object({ name: z.string() }),
	},
	async ({ name }) => `Hello ${name}`,
);

server.tool(
	{
		name: 'valibot-tool',
		schema: v.object({ age: v.number() }),
	},
	async ({ age }) => `Age: ${age}`,
);
```

### Resource Templates with Completion

```javascript
server.template(
	{
		name: 'user-profile',
		description: 'Get user profile by ID',
		uri: 'users/{userId}/profile',
		complete: (arg, context) => {
			// Provide completions for userId parameter
			return ['user1', 'user2', 'user3'];
		},
	},
	async (uri, params) => {
		const user = await getUserById(params.userId);
		return {
			contents: [
				{
					uri,
					mimeType: 'application/json',
					text: JSON.stringify(user),
				},
			],
		};
	},
);
```

### Complex Validation

```javascript
const complexSchema = z.object({
	user: z.object({
		name: z.string().min(1),
		email: z.string().email(),
		age: z.number().min(18).max(120),
	}),
	preferences: z
		.object({
			theme: z.enum(['light', 'dark']),
			notifications: z.boolean(),
		})
		.optional(),
	tags: z.array(z.string()).default([]),
});

server.tool(
	{
		name: 'create-user',
		description: 'Create a new user with preferences',
		schema: complexSchema,
	},
	async (input) => {
		// Input is fully typed and validated
		const { user, preferences, tags } = input;
		return await createUser(user, preferences, tags);
	},
);
```

## Contributing

Contributions are welcome! Please see our [contributing guidelines](../../CONTRIBUTING.md) for details.

## Acknowledgments

Huge thanks to Sean O'Bannon that provided us with the `@tmcp` scope on npm.

## License

MIT © Paolo Ricciuti
