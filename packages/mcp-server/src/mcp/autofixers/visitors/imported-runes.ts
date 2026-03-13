import { base_runes } from '../../../constants.js';
import type { Autofixer } from './index.js';

const dollarless_runes = base_runes.map((r) => r.replace('$', ''));

function should_suggest_for_source(source: string, rune: string) {
	if (!source.includes('svelte')) {
		return false;
	}
	if (source === 'svelte/store' && rune === 'derived') {
		return false;
	}
	return true;
}

export const imported_runes: Autofixer = {
	ImportDeclaration(node, { state, next }) {
		const source = (node.source.value || node.source.raw?.slice(1, -1))?.toString();
		if (source) {
			for (const specifier of node.specifiers) {
				const id =
					specifier.type === 'ImportDefaultSpecifier'
						? specifier.local
						: specifier.type === 'ImportNamespaceSpecifier'
							? specifier.local
							: specifier.type === 'ImportSpecifier'
								? specifier.imported
								: null;
				if (
					id &&
					id.type === 'Identifier' &&
					dollarless_runes.includes(id.name) &&
					should_suggest_for_source(source, id.name)
				) {
					if (
						source === 'svelte' ||
						source.startsWith('svelte/') ||
						source.startsWith('@sveltejs')
					) {
						state.output.suggestions.push(
							`You are importing "${id.name}" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$${id.name}" directly.`,
						);
					} else {
						state.output.suggestions.push(
							`You are importing "${id.name}" from "${source}". If you are trying to import runes to use them this is not necessary, all runes are globally available. Please remove this import and use "$${id.name}" directly. If you are importing the function from a separate library ignore this suggestion.`,
						);
					}
				}
			}
		}
		next();
	},
};
