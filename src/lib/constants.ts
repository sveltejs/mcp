export const base_runes = [
	'$state',
	'$effect',
	'$derived',
	'$inspect',
	'$props',
	'$bindable',
	'$host',
] as const;

export const nested_runes = [
	'$state.raw',
	'$state.snapshot',
	'$effect.pre',
	'$effect.tracking',
	'$effect.pending',
	'$effect.root',
	'$derived.by',
	'$inspect.trace',
	'$props.id',
] as const;

export const runes = [...base_runes, ...nested_runes] as const;
