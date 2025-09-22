import type { TSESTree } from '@typescript-eslint/types';
import { describe, expect, it } from 'vitest';
import { walk } from '../index.js';
import { parse, type ParseResult } from './parse.js';

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function find_declaration_identifier(
	result: ParseResult,
	matches: (id: TSESTree.Identifier, path: Array<TSESTree.Node> | null) => boolean,
): TSESTree.Identifier {
	const { ast } = result;
	let found: TSESTree.Identifier | null = null;
	walk(
		ast as unknown as TSESTree.Identifier,
		{},
		{
			Identifier(node, { stop, next, path }) {
				if (matches(node, path)) {
					found = node;
					stop();
				}
				next();
			},
		},
	);
	if (!found) throw new Error('Declaration Identifier node not found');
	return found;
}

function variable_declaration_from_id(result: ParseResult, id: TSESTree.Identifier) {
	const { all_variables: all_variables } = result;
	const variable = all_variables.find((v) => (v.defs ?? []).some((d) => d.name === id));
	if (!variable) {
		throw new Error(`Variable for the provided declaration node not found: ${id.name}`);
	}

	return variable;
}

// ----------------------------------------------------------------------
// Assertions
// ----------------------------------------------------------------------

function assert_svelte_file(result: ParseResult) {
	const { all_references } = result;

	const declaration_id = find_declaration_identifier(result, (id, path) => {
		const parent = path ? path[path.length - 1] : null;
		if (!parent || parent.type !== 'Property') return false;
		const owner = path ? path[path.length - 2] : null;
		return id.name === 'name' && parent.value === id && !!owner && owner.type === 'ObjectPattern';
	});

	const name_var = variable_declaration_from_id(result, declaration_id);
	expect(Array.isArray(name_var.defs)).toBe(true);
	expect(name_var.defs.length).toBeGreaterThan(0);
	expect(name_var.defs[0].type).toBe('Variable');
	expect(name_var.defs[0].name && name_var.defs[0].name.name).toBe('name');

	const references_to_name = all_references.filter((rf) => rf.resolved === name_var);
	expect(references_to_name.length).toBeGreaterThan(0);
}

function assert_sveltejs_file(result: ParseResult) {
	const { all_references: all_references } = result;

	const declaration_id = find_declaration_identifier(result, (id, path) => {
		const parent = path ? path[path.length - 1] : null;
		if (!parent || parent.type !== 'VariableDeclarator') return false;
		return id.name === 'v' && parent.id === id;
	});

	const v_var = variable_declaration_from_id(result, declaration_id);
	expect(Array.isArray(v_var.defs)).toBe(true);
	expect(v_var.defs.length).toBeGreaterThan(0);
	expect(v_var.defs[0].type).toBeTruthy();

	const references_to_v = all_references.filter((rf) => rf.resolved === v_var);
	expect(references_to_v.length).toBeGreaterThanOrEqual(2);

	const unresolved_update_references = all_references.filter(
		(rf) => rf.identifier && rf.identifier.name === 'update' && !rf.resolved,
	);
	expect(unresolved_update_references.length).toBeGreaterThan(0);
}

// ----------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------

describe('parse() - Svelte component parsing', () => {
	it('parses a basic .svelte component (JS)', () => {
		const code = `<script>
  const { name } = $props();
</script>

<h1>Hello {name}</h1>`;

		const result = parse(code, '/virtual/Component.svelte');
		assert_svelte_file(result);
	});

	it('parses a .svelte component with <script lang="ts">', () => {
		const code = `<script lang="ts">
  interface Props {
    name: string;
  }
  const { name }: Props = $props();
</script>

<h1>Hello {name}</h1>`;

		const result = parse(code, '/virtual/Counter.svelte');
		assert_svelte_file(result);
	});

	it('parses a .svelte.js file as a Svelte component (JS)', () => {
		const code = `export const foo = () => {
  let v = $state(0);
  const updete = (value) => {
    v.set(value);
  }
  return {
    get v() {
        return v.get();
    },
    update
  }
};`;

		const result = parse(code, '/virtual/Widget.svelte.js');
		assert_sveltejs_file(result);
	});

	it('parses a .svelte.ts file as a Svelte component (TS)', () => {
		const code = `export const foo = () => {
  let v: number = $state(0);
  const updete = (value: number) => {
    v.set(value);
  }
  return {
    get v(): number {
        return v.get();
    },
    update
  }
};`;

		const result = parse(code, '/virtual/Header.svelte.ts');
		assert_sveltejs_file(result);
	});
});
