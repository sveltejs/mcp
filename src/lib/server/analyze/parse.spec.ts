import { describe, it, expect } from 'vitest';
import { parse } from './parse';
import type { TSESTree } from '@typescript-eslint/types';

type VariableDef = { type: string; name?: { name: string } | TSESTree.Identifier };
interface Variable {
	name: string;
	defs: VariableDef[];
}
interface Reference {
	identifier?: { name: string };
	resolved?: Variable;
}
interface Scope {
	variables?: Variable[];
	references?: Reference[];
	childScopes?: Scope[];
}
interface ScopeManager {
	globalScope: Scope;
}

type ParserResult = {
	ast: TSESTree.Program;
	visitorKeys: Record<string, string[]>;
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function getAst(result: unknown): ParserResult {
	const r = result as ParserResult;
	expect(r.ast).toBeTruthy();
	expect(r.visitorKeys).toBeTruthy();
	return r;
}

function traverse(
	node: TSESTree.Node,
	visitorKeys: Record<string, string[]>,
	visitor: (node: TSESTree.Node, parent: TSESTree.Node | null) => void,
	parent: TSESTree.Node | null = null,
) {
	visitor(node, parent);
	const keys = visitorKeys[node.type] ?? [];
	for (const key of keys) {
		const child = (node as unknown as Record<string, unknown>)[key] as unknown;
		if (!child) continue;
		if (Array.isArray(child)) {
			for (const c of child) {
				if (isNode(c)) traverse(c, visitorKeys, visitor, node);
			}
		} else if (isNode(child)) {
			traverse(child, visitorKeys, visitor, node);
		}
	}
}

function isNode(x: unknown): x is TSESTree.Node {
	return !!x && typeof (x as { type?: unknown }).type === 'string';
}

function findDeclarationIdentifier(
	result: unknown,
	matches: (id: TSESTree.Identifier, parent: TSESTree.Node | null) => boolean,
): TSESTree.Identifier {
	const { ast, visitorKeys } = getAst(result);
	let found: TSESTree.Identifier | null = null;
	traverse(ast, visitorKeys, (node, parent) => {
		if (found) return;
		if (node.type !== 'Identifier') return;
		if (matches(node, parent)) found = node;
	});
	if (!found) throw new Error('Declaration Identifier node not found');
	return found;
}

function getVariableFromDeclarationIdentifier(result: unknown, id: TSESTree.Identifier): Variable {
	const { allVariables } = getAllScopesVarsRefs(result);
	const variable = allVariables.find((v) => (v.defs ?? []).some((d) => d.name === id));
	if (!variable) {
		throw new Error(`Variable for the provided declaration node not found: ${id.name}`);
	}

	return variable;
}

function getScopeManager(result: unknown): ScopeManager {
	const r = result as { scopeManager: ScopeManager };
	expect(r.scopeManager).toBeTruthy();
	return r.scopeManager;
}

function collectScopes(scope: Scope, acc: Scope[] = []): Scope[] {
	acc.push(scope);
	for (const child of scope.childScopes ?? []) collectScopes(child, acc);
	return acc;
}

function getAllScopesVarsRefs(result: unknown): {
	allScopes: Scope[];
	allVariables: Variable[];
	allReferences: Reference[];
} {
	const scopeManager = getScopeManager(result);
	const allScopes = collectScopes(scopeManager.globalScope);
	const allVariables = allScopes.flatMap((s) => s.variables ?? []);
	const allReferences = allScopes.flatMap((s) => s.references ?? []);
	return { allScopes, allVariables, allReferences };
}

// ----------------------------------------------------------------------
// Assertions
// ----------------------------------------------------------------------

function assertSvelteFile(result: unknown) {
	const { allReferences } = getAllScopesVarsRefs(result);
	const declId = findDeclarationIdentifier(result, (id, parent) => {
		if (!parent || parent.type !== 'Property') return false;
		const owner = parent.parent;
		return id.name === 'name' && parent.value === id && !!owner && owner.type === 'ObjectPattern';
	});
	const nameVar = getVariableFromDeclarationIdentifier(result, declId);
	expect(Array.isArray(nameVar.defs)).toBe(true);
	expect(nameVar.defs.length).toBeGreaterThan(0);
	expect(nameVar.defs[0].type).toBe('Variable');
	expect(nameVar.defs[0].name && nameVar.defs[0].name.name).toBe('name');
	const refsToName = allReferences.filter((rf) => rf.resolved === nameVar);
	expect(refsToName.length).toBeGreaterThan(0);
}

function assertSvelteJSFile(result: unknown) {
	const { allReferences } = getAllScopesVarsRefs(result);
	const vDeclId = findDeclarationIdentifier(result, (id, parent) => {
		if (!parent || parent.type !== 'VariableDeclarator') return false;
		return id.name === 'v' && parent.id === id;
	});
	const vVar = getVariableFromDeclarationIdentifier(result, vDeclId);
	expect(Array.isArray(vVar.defs)).toBe(true);
	expect(vVar.defs.length).toBeGreaterThan(0);
	expect(vVar.defs[0].type).toBeTruthy();

	const refsToV = allReferences.filter((rf) => rf.resolved === vVar);
	expect(refsToV.length).toBeGreaterThanOrEqual(2);
	const unresolvedUpdateRefs = allReferences.filter(
		(rf) => rf.identifier && rf.identifier.name === 'update' && !rf.resolved,
	);
	expect(unresolvedUpdateRefs.length).toBeGreaterThan(0);
}

function assertPlainJSorTSFile(result: unknown) {
	const { allReferences } = getAllScopesVarsRefs(result);

	const vDeclId = findDeclarationIdentifier(result, (id, parent) => {
		if (!parent || parent.type !== 'VariableDeclarator') return false;
		return id.name === 'v' && parent.id === id;
	});
	const vVar = getVariableFromDeclarationIdentifier(result, vDeclId);
	expect(Array.isArray(vVar.defs)).toBe(true);
	expect(vVar.defs.length).toBeGreaterThan(0);

	const refsToV = allReferences.filter((rf) => rf.resolved === vVar);
	expect(refsToV.length).toBeGreaterThanOrEqual(2);

	const updateDeclId = findDeclarationIdentifier(result, (id, parent) => {
		if (!parent || parent.type !== 'VariableDeclarator') return false;
		return id.name === 'update' && parent.id === id;
	});
	const updateVar = getVariableFromDeclarationIdentifier(result, updateDeclId);
	expect(Array.isArray(updateVar.defs)).toBe(true);
	expect(updateVar.defs.length).toBeGreaterThan(0);

	const refsToUpdate = allReferences.filter((rf) => rf.resolved === updateVar);
	expect(refsToUpdate.length).toBeGreaterThanOrEqual(1);

	const unresolvedUpdateRefs = allReferences.filter(
		(rf) => rf.identifier && rf.identifier.name === 'update' && !rf.resolved,
	);
	expect(unresolvedUpdateRefs.length).toBe(0);
}

// ----------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------

describe('parse() - Svelte component parsing', () => {
	it('parses a basic .svelte component (JS)', () => {
		const code = `\
<script>
  const { name } = $props();
</script>

<h1>Hello {name}</h1>`;

		const result = parse(code, '/virtual/Component.svelte');
		assertSvelteFile(result);
	});

	it('parses a .svelte component with <script lang="ts">', () => {
		const code = `\
<script lang="ts">
  interface Props {
    name: string;
  }
  const { name }: Props = $props();
</script>

<h1>Hello {name}</h1>`;

		const result = parse(code, '/virtual/Counter.svelte');
		assertSvelteFile(result);
	});

	it('parses a .svelte.js file as a Svelte component (JS)', () => {
		const code = `\
export const useFoo = () => {
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
		assertSvelteJSFile(result);
	});

	it('parses a .svelte.ts file as a Svelte component (TS)', () => {
		const code = `\
export const useFoo = () => {
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
		assertSvelteJSFile(result);
	});
});

describe('parse() - plain JS/TS parsing', () => {
	it('parses a basic .js module', () => {
		const code = `\
export const useFoo = () => {
  let v = 0;
  const update = (value) => {
    v = value;
  }
  return {
    v,
    update
  }
};
`;

		const result = parse(code, '/virtual/utils.js');
		assertPlainJSorTSFile(result);
	});

	it('parses a basic .ts module', () => {
		const code = `\
export const useFoo = () => {
  let v: number = 0;
  const update = (value: number) => {
    v = value;
  }
  return {
    v,
    update
  }
};
`;

		const result = parse(code, '/virtual/utils.ts');
		assertPlainJSorTSFile(result);
	});
});
