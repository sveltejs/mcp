import { describe, expect, it } from 'vitest';
import { add_autofixers_issues } from './add-autofixers-issues';

describe('add_autofixers_issues', () => {
	describe('assign_in_effect', () => {
		it('should add suggestions when assigning to a stateful variable inside an effect', () => {
			const content = { issues: [], suggestions: [] };
			const code = `
			<script>
				const count = $state(0);
				$effect(() => {
					count = 43;
				});
			</script>`;
			add_autofixers_issues(content, code, 5);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(1);
			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it('should add a suggestion for each variable assigned within an effect', () => {
			const content = { issues: [], suggestions: [] };
			const code = `
			<script>
				const count = $state(0);
				const count2 = $state(0);
				$effect(() => {
					count = 43;
					count2 = 44;
				});
			</script>`;
			add_autofixers_issues(content, code, 5);

			expect(content.suggestions.length).toBeGreaterThanOrEqual(2);
			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
			expect(content.suggestions).toContain(
				'The stateful variable "count2" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});
		it('should not add a suggestion for variables that are not assigned within an effect', () => {
			const content = { issues: [], suggestions: [] };
			const code = `
			<script>
				const count = $state(0);
			</script>
			
			<button onclick={() => count = 43}>Increment</button>
			`;
			add_autofixers_issues(content, code, 5);

			expect(content.suggestions).not.toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it("should not add a suggestions for variables that are assigned within an effect but aren't stateful", () => {
			const content = { issues: [], suggestions: [] };
			const code = `
			<script>
				const count = 0;
				
				$effect(() => {
					count = 43;
				});
			</script>`;
			add_autofixers_issues(content, code, 5);

			expect(content.suggestions).not.toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it('should add a suggestion for variables that are assigned within an effect with an update', () => {
			const content = { issues: [], suggestions: [] };
			const code = `
			<script>
				let count = $state(0);
				
				$effect(() => {
					count++;
				});
			</script>
			`;
			add_autofixers_issues(content, code, 5);

			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});

		it('should add a suggestion for variables that are mutated within an effect', () => {
			const content = { issues: [], suggestions: [] };
			const code = `
			<script>
				let count = $state({ value: 0 });
				
				$effect(() => {
					count.value = 42;
				});
			</script>
			`;
			add_autofixers_issues(content, code, 5);

			expect(content.suggestions).toContain(
				'The stateful variable "count" is assigned inside an $effect which is generally consider a malpractice. Consider using $derived if possible.',
			);
		});
	});
});
