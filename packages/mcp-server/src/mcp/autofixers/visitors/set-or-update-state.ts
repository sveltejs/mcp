import type { Autofixer } from './index.js';
import { left_most_id } from '../ast/utils.js';

const UPDATE_PROPERTIES = ['set', 'update'];

export const set_or_update_state: Autofixer = {
	MemberExpression(node, { state, next, path }) {
		const parent = path[path.length - 1];
		if (
			parent?.type === 'CallExpression' &&
			parent.callee === node &&
			node.property.type === 'Identifier' &&
			UPDATE_PROPERTIES.includes(node.property.name)
		) {
			const id = left_most_id(node);
			if (id) {
				const reference = state.parsed.find_reference_by_id(id);
				const definition = reference?.resolved?.defs[0];
				if (definition && definition.type === 'Variable') {
					const init = definition.node.init;
					if (
						init?.type === 'CallExpression' &&
						state.parsed.is_rune(init, ['$state', '$state.raw'])
					) {
						let suggestion = `You are trying to update the stateful variable "${id.name}" using "${node.property.name}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them.`;
						const argument = init.arguments[0];
						if (!argument || (argument.type !== 'Literal' && argument.type !== 'ArrayExpression')) {
							suggestion += ` However I can't verify if "${id.name}" is a state variable of an object or a class with a "${node.property.name}" method on it. Please verify that before updating the code to use a normal assignment`;
						}
						state.output.suggestions.push(suggestion);
					}
				}
			}
		}
		next();
	},
};
