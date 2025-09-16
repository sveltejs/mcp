import { walk as _walk } from 'zimmerframe';

type WalkParams<
	T extends {
		type: string;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	U extends Record<string, any> | null,
> = Parameters<typeof _walk<T, U>>;

export function walk<
	T extends {
		type: string;
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
