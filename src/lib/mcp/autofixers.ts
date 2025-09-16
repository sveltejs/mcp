import type { Node } from 'estree';
import type { Visitors } from 'zimmerframe';
import type { ParseResult } from '$lib/server/analyze/parse.js';

export type Autofixer = Visitors<
	Node,
	{ output: { issues: string[]; suggestions: string[] }; parsed: ParseResult }
>;

export const assign_in_effect: Autofixer = {
	AssignmentExpression(node, { path, state }) {
		const in_effect = path.findLast(
			(node) =>
				node.type === 'CallExpression' &&
				node.callee.type === 'Identifier' &&
				node.callee.name === '$effect',
		);
		if (
			in_effect &&
			in_effect.type === 'CallExpression' &&
			(in_effect.callee.type === 'Identifier' || in_effect.callee.type === 'MemberExpression')
		) {
			if (state.parsed.is_rune(in_effect, ['$effect', '$effect.pre'])) {
				if (node.left.type === 'Identifier') {
					const reference = state.parsed.find_reference_by_id(node.left);
					const definition = reference?.resolved?.defs[0];
					if (definition && definition.type === 'Variable') {
						const init = definition.node.init;
						if (
							init?.type === 'CallExpression' &&
							state.parsed.is_rune(init, ['$state', '$state.raw'])
						) {
							state.output.suggestions.push(
								`The stateful variable "${node.left.name}" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.`,
							);
						}
					}
				}
			}
		}
	},
};
