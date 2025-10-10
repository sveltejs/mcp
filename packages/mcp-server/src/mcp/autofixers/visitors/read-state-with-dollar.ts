import type { Autofixer } from './index.js';

export const read_state_with_dollar: Autofixer = {
	Identifier(node, { state }) {
		if (node.name.startsWith('$')) {
			const reference = state.parsed.find_reference_by_id(node);
			if (reference && reference.resolved && reference.resolved.defs[0]?.node?.init) {
				const is_state = state.parsed.is_rune(reference.resolved.defs[0].node.init, [
					'$state',
					'$state.raw',
					'$derived',
					'$derived.by',
				]);
				if (is_state) {
					state.output.issues.push(
						`You are reading the stateful variable "${node.name}" with a "$" prefix. Stateful variables are not stores and should be read without the "$". Please read it as a normal variable "${node.name.substring(1)}"`,
					);
				}
			}
		}
	},
};
