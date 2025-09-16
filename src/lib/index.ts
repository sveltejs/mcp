/* eslint-disable @typescript-eslint/no-explicit-any */
import { walk as _walk } from 'zimmerframe';
import type { Autofixer } from './mcp/autofixers';

export type WalkParams<
	T extends {
		type: string;
	},
	U extends Record<string, any> | null,
> = Parameters<typeof _walk<T, U>>;

export function walk<
	T extends {
		type: string;
	},
	U extends Record<string, any> | null,
>(...args: WalkParams<T, U>) {
	const [node, state, visitors] = args;
	const visited = new WeakSet();
	return _walk<T, U>(node, state, {
		_(node, ctx) {
			if (visited.has(node)) return;
			visited.add(node);
			if (visitors._) {
				const ret = visitors._(node, ctx);
				if (ret) return ret;
			} else {
				ctx.next();
			}
		},
		...visitors,
	});
}

export function mix_visitors(autofixers: Record<string, Autofixer>): Autofixer {
	const visitors: Autofixer = {};
	for (const key in autofixers) {
		const new_visitors = autofixers[key];
		for (const node_type in new_visitors) {
			if (node_type in visitors) {
				const existing_visitor = visitors[node_type as keyof typeof visitors]!;
				const new_visitor = new_visitors[node_type as keyof typeof visitors]!;
				visitors[node_type as keyof typeof visitors] = (node, ctx) => {
					(existing_visitor as any)(node, ctx);
					(new_visitor as any)(node, ctx);
				};
			} else {
				visitors[node_type as keyof typeof visitors] = new_visitors[
					node_type as keyof typeof visitors
				] as never;
			}
		}
	}
	return visitors;
}
