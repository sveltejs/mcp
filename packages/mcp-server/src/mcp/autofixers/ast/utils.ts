import type { Identifier, MemberExpression } from 'estree';

/**
 * Gets the left-most identifier of a member expression or identifier.
 */
export function left_most_id(expression: MemberExpression | Identifier) {
	while (expression.type === 'MemberExpression') {
		expression = expression.object as MemberExpression | Identifier;
	}

	if (expression.type !== 'Identifier') {
		return null;
	}

	return expression;
}
