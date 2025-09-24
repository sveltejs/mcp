import type { Autofixer } from './index.js';

export const use_runes_instead_of_store: Autofixer = {
	ImportDeclaration(node, { state, next }) {
		const source = (node.source.value || node.source.raw?.slice(1, -1))?.toString();
		if (source && source === 'svelte/store') {
			for (const specifier of node.specifiers) {
				if (
					specifier.type === 'ImportSpecifier' &&
					specifier.imported.type === 'Identifier' &&
					['derived', 'writable', 'readable'].includes(specifier.imported.name)
				) {
					state.output.suggestions.push(
						`You are importing "${specifier.imported.name}" from "svelte/store". Unless the user specifically asked for stores or it's required because some library/component requires a store as input consider using runes like \`$state\` or \`$derived\` instead, all runes are globally available.`,
					);
				}
			}
		}
		next();
	},
};
