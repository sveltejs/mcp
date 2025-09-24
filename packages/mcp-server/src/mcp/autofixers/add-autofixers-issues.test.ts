import { describe, expect, it } from 'vitest';
import { add_autofixers_issues } from './add-autofixers-issues.js';
import { base_runes } from '../../constants.js';

const dollarless_runes = base_runes.map((r) => ({ rune: r.replace('$', '') }));

function run_autofixers_on_code(code: string, desired_svelte_version = 5) {
	const content = { issues: [], suggestions: [] };
	add_autofixers_issues(content, code, desired_svelte_version);
	return content;
}

describe('add_autofixers_issues', () => {
	describe('assign_in_effect', () => {
		it(`should add suggestions when assigning to a stateful variable inside an effect`, () => {
			const content = run_autofixers_on_code(`
			<script>
				const count = $state(0);
				$effect(() => {
					count = 43;
				});
			</script>`);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it(`should add a suggestion for each variable assigned within an effect`, () => {
			const content = run_autofixers_on_code(`
			<script>
				const count = $state(0);
				const count2 = $state(0);
				$effect(() => {
					count = 43;
					count2 = 44;
				});
			</script>`);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(2);
			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
			expect(content.suggestions).toContain(
				'The stateful variable "count2" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});
		it(`should not add a suggestion for variables that are not assigned within an effect`, () => {
			const content = run_autofixers_on_code(`
			<script>
				const count = $state(0);
			</script>
			
			<button onclick={() => count = 43}>Increment</button>
			`);

			expect(content.suggestions).not.toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it("should not add a suggestions for variables that are assigned within an effect but aren't stateful", () => {
			const content = run_autofixers_on_code(`
			<script>
				const count = 0;
				
				$effect(() => {
					count = 43;
				});
			</script>`);

			expect(content.suggestions).not.toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it(`should add a suggestion for variables that are assigned within an effect with an update`, () => {
			const content = run_autofixers_on_code(`
			<script>
				let count = $state(0);
				
				$effect(() => {
					count++;
				});
			</script>
			`);

			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it(`should add a suggestion for variables that are mutated within an effect`, () => {
			const content = run_autofixers_on_code(`
			<script>
				let count = $state({ value: 0 });
				
				$effect(() => {
					count.value = 42;
				});
			</script>
			`);

			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});
	});

	describe.each([{ method: 'set' }, { method: 'update' }])(
		'wrong_property_access_state ($method)',
		({ method }) => {
			it(`should add suggestions when using .${method}() on a stateful variable with a literal init`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state(0);
				function update_count() {
					count.${method}(43);
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to update the stateful variable "count" using "${method}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them.`,
				);
			});

			it(`should add suggestions when using .${method}() on a stateful variable with an array init`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state([0]);
				function update_count() {
					count.${method}([1]);
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to update the stateful variable "count" using "${method}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them.`,
				);
			});

			it(`should add suggestions when using .${method}() on a stateful variable with conditional if it's not sure if the method could actually be present on the variable ($state({}))`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state({ value: 0 });
				function update_count() {
					count.${method}({ value: 43 });
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to update the stateful variable "count" using "${method}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them. However I can't verify if "count" is a state variable of an object or a class with a "${method}" method on it. Please verify that before updating the code to use a normal assignment`,
				);
			});

			it(`should add suggestions when using .${method}() on a stateful variable with conditional if it's not sure if the method could actually be present on the variable ($state(new Class()))`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state(new Class());
				function update_count() {
					count.${method}(new Class());
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to update the stateful variable "count" using "${method}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them. However I can't verify if "count" is a state variable of an object or a class with a "${method}" method on it. Please verify that before updating the code to use a normal assignment`,
				);
			});

			it(`should add suggestions when using .${method}() on a stateful variable with conditional if it's not sure if the method could actually be present on the variable ($state(variable_name))`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const { init } = $props();
				const count = $state(init);
				function update_count() {
					count.${method}(43);
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to update the stateful variable "count" using "${method}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them. However I can't verify if "count" is a state variable of an object or a class with a "${method}" method on it. Please verify that before updating the code to use a normal assignment`,
				);
			});

			it(`should not add suggestions when using .${method} on a stateful variable if it's not a method call`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state({});
				function update_count() {
					console.log(count.${method});
				}
			</script>`);

				expect(content.suggestions).not.toContain(
					`You are trying to update the stateful variable "count" using "${method}". stateful variables should be updated with a normal assignment/mutation, do not use methods to update them. However I can't verify if "count" is a state variable of an object or a class with a "${method}" method on it. Please verify that before updating the code to use a normal assignment`,
				);
			});
		},
	);

	describe.each([{ property: '$' }])(
		'wrong_property_access_state property ($property)',
		async ({ property }) => {
			it(`should add suggestions when reading .${property} on a stateful variable with a literal init`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state(0);
				function read_count() {
					count.${property};
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to read the stateful variable "count" using "${property}". stateful variables should be read just by accessing them like normal variable, do not use properties to read them.`,
				);
			});

			it(`should add suggestions when reading .${property} on a stateful variable with an array init`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state([1]);
				function read_count() {
					count.${property};
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to read the stateful variable "count" using "${property}". stateful variables should be read just by accessing them like normal variable, do not use properties to read them.`,
				);
			});

			it(`should add suggestions when reading .${property} on a stateful variable with conditional if it's not sure if the property could actually be present on the variable ($state({}))`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state({ value: 0 });
				function read_count() {
					count.${property};
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to read the stateful variable "count" using "${property}". stateful variables should be read just by accessing them like normal variable, do not use properties to read them. However I can't verify if "count" is a state variable of an object or a class with a "${property}" property on it. Please verify that before updating the code to use a normal access`,
				);
			});

			it(`should add suggestions when reading .${property} on a stateful variable with conditional if it's not sure if the property could actually be present on the variable ($state(new Class()))`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const count = $state(new Class());
				function read_count() {
					count.${property};
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to read the stateful variable "count" using "${property}". stateful variables should be read just by accessing them like normal variable, do not use properties to read them. However I can't verify if "count" is a state variable of an object or a class with a "${property}" property on it. Please verify that before updating the code to use a normal access`,
				);
			});

			it(`should add suggestions when reading .${property} on a stateful variable with conditional if it's not sure if the property could actually be present on the variable ($state(variable_name))`, () => {
				const content = run_autofixers_on_code(`
			<script>
				const { init } = $props();
				const count = $state(init);
				function read_count() {
					count.${property};
				}
			</script>`);

				expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
				expect(content.suggestions).toContain(
					`You are trying to read the stateful variable "count" using "${property}". stateful variables should be read just by accessing them like normal variable, do not use properties to read them. However I can't verify if "count" is a state variable of an object or a class with a "${property}" property on it. Please verify that before updating the code to use a normal access`,
				);
			});
		},
	);

	describe('imported_runes', () => {
		describe.each([{ source: 'svelte' }, { source: 'svelte/runes' }])(
			'from "$source"',
			({ source }) => {
				describe.each(dollarless_runes)('single import ($rune)', ({ rune }) => {
					it(`should add suggestions when importing '${rune}' from '${source}'`, () => {
						const content = run_autofixers_on_code(`
					<script>
						import { ${rune} } from '${source}';
					</script>`);

						expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
						expect(content.suggestions).toContain(
							`You are importing "${rune}" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$${rune}" directly.`,
						);
					});

					it(`should add suggestions when importing "${rune}" as the default export from '${source}'`, () => {
						const content = run_autofixers_on_code(`
					<script>
						import ${rune} from '${source}';
					</script>`);

						expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
						expect(content.suggestions).toContain(
							`You are importing "${rune}" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$${rune}" directly.`,
						);
					});

					it(`should add suggestions when importing '${rune}' as the namespace export from '${source}'`, () => {
						const content = run_autofixers_on_code(`
					<script>
						import * as ${rune} from '${source}';
					</script>`);

						expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
						expect(content.suggestions).toContain(
							`You are importing "${rune}" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$${rune}" directly.`,
						);
					});
				});

				it(`should add suggestions when importing multiple runes from '${source}'`, () => {
					const content = run_autofixers_on_code(`
					<script>
						import { onMount, state, effect } from '${source}';
					</script>`);

					expect(content.suggestions.length).toBeGreaterThanOrEqual(2);
					expect(content.suggestions).toContain(
						`You are importing "state" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$state" directly.`,
					);
					expect(content.suggestions).toContain(
						`You are importing "effect" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$effect" directly.`,
					);
				});

				it(`should not add suggestions when importing other identifiers from '${source}'`, () => {
					const content = run_autofixers_on_code(`
					<script>
						import { onMount } from '${source}';
					</script>`);

					expect(content.suggestions).not.toContain(
						`You are importing "onMount" from "${source}". This is not necessary, all runes are globally available. Please remove this import and use "$onMount" directly.`,
					);
				});
			},
		);
	});

	describe('derived_with_function', () => {
		it(`should add suggestions when using a function as the first argument to $derived`, () => {
			const content = run_autofixers_on_code(`
			<script>
				const value = $derived(() => {
					return 43;
				});
			</script>`);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
			expect(content.suggestions).toContain(
				'You are passing a function to $derived when declaring "value" but $derived expects an expression. You can use $derived.by instead.',
			);
		});

		it(`should add suggestions when using a function as the first argument to $derived in classes`, () => {
			const content = run_autofixers_on_code(`
			<script>
				class Double {
					value = $derived(() => 43);
				}
			</script>`);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
			expect(content.suggestions).toContain(
				'You are passing a function to $derived when declaring "value" but $derived expects an expression. You can use $derived.by instead.',
			);
		});

		it(`should add suggestions when using a function as the first argument to $derived in classes constructors`, () => {
			const content = run_autofixers_on_code(`
			<script>
				class Double {
					value;

					constructor(){
						this.value = $derived(function() { return 44; });
					}
				}
			</script>`);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
			expect(content.suggestions).toContain(
				'You are passing a function to $derived when declaring "value" but $derived expects an expression. You can use $derived.by instead.',
			);
		});

		it(`should add suggestions when using a function as the first argument to $derived without the declaring part if it's not an identifier`, () => {
			const content = run_autofixers_on_code(`
			<script>
				const { destructured } = $derived(() => 43);
			</script>`);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
			expect(content.suggestions).toContain(
				'You are passing a function to $derived but $derived expects an expression. You can use $derived.by instead.',
			);
		});

		it(`should add suggestions when using a function as the first argument to $derived.by`, () => {
			const content = run_autofixers_on_code(`
			<script>
				const { destructured } = $derived.by(() => 43);
			</script>`);

			expect(content.suggestions).not.toContain(
				'You are passing a function to $derived but $derived expects an expression. You can use $derived.by instead.',
			);
		});
	});

	describe('use_runes_instead_of_store', () => {
		describe.each([{ import: 'derived' }, { import: 'writable' }, { import: 'readable' }])(
			'importing $import from svelte/store',
			({ import: imported }) => {
				it(`should add suggestions when importing '${imported}' from 'svelte/store'`, () => {
					const content = run_autofixers_on_code(`
				<script>
					import { ${imported} } from 'svelte/store';
				</script>`);

					expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
					expect(content.suggestions).toContain(
						`You are importing "${imported}" from "svelte/store". Unless the user specifically asked for stores or it's required because some library/component requires a store as input consider using runes like \`$state\` or \`$derived\` instead, all runes are globally available.`,
					);
				});
			},
		);

		it(`should not add suggestions when importing other identifiers from 'svelte/store'`, () => {
			const content = run_autofixers_on_code(`
			<script>
				import { get } from 'svelte/store';
			</script>`);

			expect(content.suggestions).not.toContain(
				`You are importing "get" from "svelte/store". Unless the user specifically asked for stores or it's required because some library/component requires a store as input consider using runes like \`$state\` or \`$derived\` instead, all runes are globally available.`,
			);
		});
	});
});
