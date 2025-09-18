import { describe, expect, it } from 'vitest';
import { add_autofixers_issues } from './add-autofixers-issues.js';

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
		'set_or_update_state ($method)',
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
});
