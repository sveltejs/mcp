import fs from 'node:fs/promises';
import path from 'node:path';

let content = `---
title: Prompts
---

This is the list of available prompts provided by the MCP server. Prompts are selected by the user and are sent as a user message. They can be useful to write repetitive instructions for the LLM on how to properly use the MCP server.

`;

const prompts_generators = fs.glob('./packages/mcp-server/src/mcp/handlers/prompts/*.ts');

const filename_regex = /packages\/mcp-server\/src\/mcp\/handlers\/prompts\/(?<prompt>.+)\.ts/;

for await (const file of prompts_generators) {
	const title = file.match(filename_regex)?.groups?.prompt;
	if (title === 'index') continue;
	const module = await import(path.resolve('./', file));
	content += `## ${title}

${module.docs_description}

<details>
	<summary>Copy the prompt</summary>

\`\`\`md
${await module.generate_for_docs()}
\`\`\`

</details>

`;
}

await fs.writeFile('./documentation/docs/30-capabilities/30-prompts.md', content.trim() + '\n');
