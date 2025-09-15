import { parseForESLint as svelteParseForESLint } from 'svelte-eslint-parser';
import tsParser from '@typescript-eslint/parser';

export function parse(code: string, filePath: string) {
	const isSvelte = /\.svelte(\.(t|j)s)?$/i.test(filePath);
	if (isSvelte) {
		return svelteParseForESLint(code, {
			filePath,
			parser: { ts: tsParser, typescript: tsParser },
		});
	}

	return tsParser.parseForESLint(code, {
		filePath,
	});
}
