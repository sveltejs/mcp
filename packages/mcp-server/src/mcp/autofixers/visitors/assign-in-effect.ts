import type { AssignmentExpression, Identifier, Node, UpdateExpression } from 'estree';
import type { Autofixer, AutofixerState } from '.';
import { left_most_id } from '../ast/utils.js';
import type { SvelteNode } from 'svelte-eslint-parser/lib/ast';
import type { Context } from 'zimmerframe';

function run_if_in_effect(path: (Node | SvelteNode)[], state: AutofixerState, to_run: () => void) {
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
			to_run();
		}
	}
}

function visitor(
	node: UpdateExpression | AssignmentExpression,
	{ state, path }: Context<Node | SvelteNode, AutofixerState>,
) {
	run_if_in_effect(path, state, () => {
		function check_if_stateful_id(id: Identifier) {
			const reference = state.parsed.find_reference_by_id(id);
			const definition = reference?.resolved?.defs[0];
			if (definition && definition.type === 'Variable') {
				const init = definition.node.init;
				if (
					init?.type === 'CallExpression' &&
					state.parsed.is_rune(init, ['$state', '$state.raw'])
				) {
					state.output.suggestions.push(
						`The stateful variable "${id.name}" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.`,
					);
				}
			}
		}
		const variable = node.type === 'UpdateExpression' ? node.argument : node.left;

		if (variable.type === 'Identifier') {
			check_if_stateful_id(variable);
		} else if (variable.type === 'MemberExpression') {
			const object = left_most_id(variable);
			if (object) {
				check_if_stateful_id(object);
			}
		}
	});
}

export const assign_in_effect: Autofixer = {
	UpdateExpression: visitor,
	AssignmentExpression: visitor,
};
