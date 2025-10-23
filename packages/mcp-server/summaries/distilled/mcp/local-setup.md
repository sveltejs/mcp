# MCP Server Setup

The Svelte MCP server is available via [`@sveltejs/mcp`](https://www.npmjs.com/package/@sveltejs/mcp). Run with:

```bash
npx -y @sveltejs/mcp
```

## Client Configuration

### Claude Code
```bash
claude mcp add -t stdio -s [scope] svelte -- npx -y @sveltejs/mcp
```
`[scope]`: `user`, `project`, or `local`

### Claude Desktop
Settings > Developer > Edit Config, add to `claude_desktop_config.json`:

```json
{
	"mcpServers": {
		"svelte": {
			"command": "npx",
			"args": ["-y", "@sveltejs/mcp"]
		}
	}
}
```

### Codex CLI
Add to `config.toml` (default: `~/.codex/config.toml`):

```toml
[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]
```

### Gemini CLI
```bash
gemini mcp add -t stdio -s [scope] svelte npx -y @sveltejs/mcp
```
`[scope]`: `user`, `project`, or `local`

### OpenCode
```bash
opencode mcp add
```
Select 'Local' and enter `npx -y @sveltejs/mcp`

### VS Code
Command palette > "MCP: Add Server..." > "Command (stdio)" > `npx -y @sveltejs/mcp` > name: `svelte`

### Cursor
Command palette > "View: Open MCP Settings" > "Add custom MCP", add:

```json
{
	"mcpServers": {
		"svelte": {
			"command": "npx",
			"args": ["-y", "@sveltejs/mcp"]
		}
	}
}
```

### Zed
Command palette > "agent:open settings" > `Model Context Protocol (MCP) Servers` > "Add Server" > "Add Custom Server":

```json
{
	"svelte": {
		"command": "npx",
		"args": ["-y", "@sveltejs/mcp"]
	}
}
```

### Other Clients
Use `stdio` server with command `npx` and args `-y @sveltejs/mcp`