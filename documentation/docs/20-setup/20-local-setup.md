---
title: Local setup
---

The local (or stdio) version of the MCP server is available via the [`@sveltejs/mcp`](https://www.npmjs.com/package/@sveltejs/mcp) npm package. You can either install it globally and then reference it in your configuration or run it with `npx`:

```bash
npx -y @sveltejs/mcp
```

Here's how to set it up in some common MCP clients:

## Claude Code

To include the local MCP version in Claude Code, simply run the following command:

```bash
claude mcp add -t stdio -s [scope] svelte npx -y @sveltejs/mcp
```

You can choose your preferred `scope` (it must be `user`, `project` or `local`) and `name`.

## Claude Desktop

In the Settings > Developer section, click on Edit Config. It will open the folder with a `claude_desktop_config.json` file in it. Edit the file to include the following configuration:

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

The top level must be `mcpServers` but you can choose your preferred `name`.

## Codex CLI

Add the following to your `config.toml` (which defaults to `~/.codex/config.toml`, but refer to [the configuration documentation](https://github.com/openai/codex/blob/main/docs/config.md) for more advanced setups):

```toml
[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]
```

The top level must be `mcp_server` but you can choose your preferred `name`.

## Gemini CLI

To include the local MCP version in Gemini CLI, simply run the following command:

```bash
gemini mcp add -t stdio -s [scope] svelte npx -y @sveltejs/mcp
```

You can choose your preferred `scope` (it must be `user`, `project` or `local`) and `name`.

## OpenCode

Run the command:

```bash
opencode mcp add
```

and follow the instructions, selecting 'Local' under the 'Select MCP server type' prompt:

```bash
opencode mcp add

┌  Add MCP server
│
◇  Enter MCP server name
│  svelte
│
◇  Select MCP server type
│  Local
│
◆  Enter command to run
│  npx -y @sveltejs/mcp
```

You can choose your preferred `name`.

## VS Code

- Open the command palette
- Select "MCP: Add Server..."
- Select "Command (stdio)"
- Insert `npx -y @sveltejs/mcp` in the input and press `Enter`
- Insert your preferred name
- Select if you want to add it as a `Global` or `Workspace` MCP server

## Cursor

- Open the command palette
- Select "View: Open MCP Settings"
- Click on "Add custom MCP"

It will open a file with your MCP servers where you can add the following configuration:

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

The top level must be `mcpServers` but you can choose your preferred `name`.

## Other clients

If we didn't include the MCP client you are using, refer to their documentation for `stdio` servers and use `npx` as the command and `-y @sveltejs/mcp` as the arguments.
