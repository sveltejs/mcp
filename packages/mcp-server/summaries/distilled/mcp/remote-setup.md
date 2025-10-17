# MCP Server Setup

Remote MCP server URL: `https://mcp.svelte.dev/mcp`

## Claude Code

```bash
claude mcp add -t http -s [scope] svelte https://mcp.svelte.dev/mcp
```

`scope` must be `user`, `project`, or `local`

## Claude Desktop

Settings > Connectors > Add Custom Connector
- Name: `svelte`
- URL: `https://mcp.svelte.dev/mcp`

## Codex CLI

Add to `config.toml` (default: `~/.codex/config.toml`):

```toml
experimental_use_rmcp_client = true
[mcp_servers.svelte]
url = "https://mcp.svelte.dev/mcp"
```

## Gemini CLI

```bash
gemini mcp add -t http -s [scope] svelte https://mcp.svelte.dev/mcp
```

`[scope]` must be `user`, `project`, or `local`

## OpenCode

```bash
opencode mcp add
```

Select 'Remote' type, enter name `svelte` and URL `https://mcp.svelte.dev/mcp`

## VS Code

Command palette > "MCP: Add Server..." > "HTTP (HTTP or Server-Sent-Events)"
- URL: `https://mcp.svelte.dev/mcp`
- Choose Global or Workspace

## Cursor

Command palette > "View: Open MCP Settings" > "Add custom MCP"

```json
{
	"mcpServers": {
		"svelte": {
			"url": "https://mcp.svelte.dev/mcp"
		}
	}
}
```

## Other Clients

Use `https://mcp.svelte.dev/mcp` as remote server URL per client documentation.