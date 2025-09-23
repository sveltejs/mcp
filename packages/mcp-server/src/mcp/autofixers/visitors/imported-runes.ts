import { base_runes } from '../../../constants.js';
import type { Autofixer } from '.';

const dollarless_runes = base_runes.map((r) => r.replace('$', ''));

export const imported_runes: Autofixer = {
	ImportDeclaration(node, { state, next }) {
		const source = (node.source.value || node.source.raw?.slice(1, -1))?.toString();
		if (source && source.startsWith('svelte')) {
			for (const specifier of node.specifiers) {
				const id =
					specifier.type === 'ImportDefaultSpecifier'
						? specifier.local
						: specifier.type === 'ImportNamespaceSpecifier'
							? specifier.local
							: specifier.type === 'ImportSpecifier'
								? specifier.imported
								: null;
				if (id && id.type === 'Identifier' && dollarless_runes.includes(id.name)) {
					state.output.suggestions.push(
						`You are importing "${id.name}" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$${id.name}" directly.`,
					);
				}
			}
		}
		next();
	},
};
