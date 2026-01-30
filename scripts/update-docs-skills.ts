import fs from 'node:fs/promises';
import path from 'node:path';

interface SkillFrontmatter {
	name: string;
	description: string;
}

function parse_frontmatter(
	content: string,
): { frontmatter: SkillFrontmatter; body: string } | null {
	const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return null;

	const frontmatter_str = match[1];
	const body = match[2];

	if (!frontmatter_str || body === undefined) return null;

	const frontmatter: Record<string, string> = {};

	for (const line of frontmatter_str.split('\n')) {
		const [key, ...value_parts] = line.split(':');
		if (key && value_parts.length > 0) {
			frontmatter[key.trim()] = value_parts.join(':').trim();
		}
	}

	return {
		frontmatter: frontmatter as unknown as SkillFrontmatter,
		body: body.trim(),
	};
}

let content = `---
title: Overview
---

This is the list of available skills provided by the Svelte MCP package. Skills are sets of instructions that AI agents can load on-demand to help with specific tasks.

Skills are available in both the Claude Code plugin (installed via the marketplace) and the OpenCode plugin (\`@sveltejs/opencode\`). They can also be manually installed in your \`.claude/skills/\` or \`.opencode/skills/\` folder.

You can download the latest skills from the [releases page](https://github.com/sveltejs/mcp/releases) or find them in the [\`plugins/svelte/skills\`](https://github.com/sveltejs/mcp/tree/main/plugins/svelte/skills) folder.

`;

const skills_dir = './plugins/svelte/skills';
const skill_dirs = (await fs.readdir(skills_dir)).filter((name) => !name.startsWith('.'));

for (const skill_name of skill_dirs) {
	const skill_path = path.join(skills_dir, skill_name, 'SKILL.md');

	try {
		const skill_content = await fs.readFile(skill_path, 'utf-8');
		const parsed = parse_frontmatter(skill_content);

		if (!parsed) {
			console.warn(`Warning: Could not parse frontmatter for ${skill_name}`);
			continue;
		}

		const { frontmatter, body } = parsed;

		content += `## \`${frontmatter.name}\`

${frontmatter.description}

<a href="https://github.com/sveltejs/mcp/releases?q=${frontmatter.name}" target="_blank" rel="noopener noreferrer">Open Releases page</a>

<details>
	<summary>View skill content</summary>

~~~markdown
${body}
~~~

</details>

`;
	} catch {
		console.warn(`Warning: Could not read skill at ${skill_path}`);
	}
}

await fs.writeFile('./documentation/docs/60-skills/10-skills.md', content.trim() + '\n');
