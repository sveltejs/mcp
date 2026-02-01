---
title: Overview
---

The Svelte MCP ([Model Context Protocol](https://modelcontextprotocol.io/docs/getting-started/intro)) server can help your LLM or agent of choice write better Svelte code. It works by providing documentation relevant to the task at hand, and statically analysing generated code so that it can suggest fixes and best practices.

## Setup

The setup varies based on the version of the MCP you prefer — remote or local — and your chosen MCP client (e.g. Claude Code, Codex CLI or GitHub Copilot):

- [local setup](local-setup) using `@sveltejs/mcp`
- [remote setup](remote-setup) using `https://mcp.svelte.dev/mcp`

## Usage

To get the most out of the MCP server we recommend including the following prompt in your [`AGENTS.md`](https://agents.md) (or [`CLAUDE.md`](https://docs.claude.com/en/docs/claude-code/memory#claude-md-imports), if using Claude Code. Or [`GEMINI.md`](https://geminicli.com/docs/cli/gemini-md/), if using GEMINI). This will tell the LLM which tools are available and when it's appropriate to use them.

> [!NOTE] This is already setup for you when using `npx sv add mcp`

@include .generated/agents.md

If your MCP client supports it, we also recommend using the [svelte-task](prompts#svelte-task) prompt to instruct the LLM on the best way to use the MCP server.
