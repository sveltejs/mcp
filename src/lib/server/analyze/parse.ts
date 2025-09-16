import { parseForESLint as svelte_eslint_parse } from 'svelte-eslint-parser';
import ts_parser from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/types';

type VariableDef = { type: string; name?: { name: string } | TSESTree.Identifier };

type Variable = {
	name: string;
	defs: VariableDef[];
};
type Reference = {
	identifier?: { name: string };
	resolved?: Variable;
};
type Scope = {
	variables?: Variable[];
	references?: Reference[];
	childScopes?: Scope[];
};
type ScopeManager = {
	globalScope: Scope;
};

function collect_scopes(scope: Scope, acc: Scope[] = []) {
	acc.push(scope);
	for (const child of scope.childScopes ?? []) collect_scopes(child, acc);
	return acc;
}

export function parse(code: string, file_path: string) {
	const parsed = svelte_eslint_parse(code, {
		filePath: file_path,
		parser: { ts: ts_parser, typescript: ts_parser },
	});
	let all_scopes: Scope[] | undefined;
	let all_variables: Variable[] | undefined;
	let all_references: Reference[] | undefined;

	function get_all_scopes() {
		if (!all_scopes) {
			all_scopes = collect_scopes(parsed.scopeManager!.globalScope);
		}
		return all_scopes;
	}
	return {
		ast: parsed.ast,
		scope_manager: parsed.scopeManager as ScopeManager,
		visitor_keys: parsed.visitorKeys,
		get all_scopes() {
			return get_all_scopes();
		},
		get all_variables() {
			if (!all_variables) {
				all_variables = get_all_scopes().flatMap((s) => s.variables ?? []);
			}
			return all_variables;
		},
		get all_references() {
			if (!all_references) {
				all_references = get_all_scopes().flatMap((s) => s.references ?? []);
			}
			return all_references;
		},
	};
}
