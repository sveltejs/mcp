import type { Autofixer } from '.';
export const bind_this_attachment: Autofixer = {
	SvelteDirective(node, { state, next, path }) {
		if (node.kind === 'Binding' && node.key.name.name === 'this') {
			const parent_element = path.findLast((p) => p.type === 'SvelteElement');
			if (parent_element?.kind === 'html' && parent_element.startTag.attributes.includes(node)) {
				let better_an_attachment = ` or even better an \`attachment\``;
				if (state.desired_svelte_version === 4) {
					better_an_attachment = ``;
				}
				state.output.suggestions.push(
					`The usage of \`bind:this\` can often be replaced with an easier to read \`action\`${better_an_attachment}. Consider using the latter if possible.`,
				);
			}
		}
		next();
	},
};
