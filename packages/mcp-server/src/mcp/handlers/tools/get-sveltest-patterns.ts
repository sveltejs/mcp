import type { SvelteMcp } from '../../index.js';
import * as v from 'valibot';
import { icons } from '../../icons/index.js';

export function get_sveltest_patterns(server: SvelteMcp) {
	server.tool(
		{
			name: 'get-sveltest-patterns',
			description:
				'Retrieves comprehensive testing patterns for Svelte components using vitest-browser-svelte. Provides setup instructions, testing patterns, best practices, and troubleshooting for real browser testing of Svelte 5 applications. Includes Client-Server Alignment Strategy, locator hierarchy, and common testing scenarios.',
			schema: v.object({
				pattern: v.pipe(
					v.union([v.string(), v.array(v.string())]),
					v.description(
						'The pattern type(s) to retrieve. Options: "setup", "component-testing", "form-testing", "async-testing", "runes-testing", "browser-testing", "locators", "mocking", "troubleshooting", "best-practices". Can be a single string or array of strings.',
					),
				),
				component_type: v.pipe(
					v.optional(v.string()),
					v.description(
						'The type of component being tested (optional). Options: "button", "form", "input", "modal", "list", "async-component", "custom-element". Helps provide more specific patterns.',
					),
				),
			}),
			icons,
		},
		async ({ pattern, component_type }) => {
			if (server.ctx.sessionId && server.ctx.custom?.track) {
				await server.ctx.custom?.track?.(server.ctx.sessionId, 'get-sveltest-patterns');
			}

			let patterns: string[];
			if (Array.isArray(pattern)) {
				patterns = pattern;
			} else {
				patterns = [pattern];
			}

			const response: { [key: string]: string } = {};

			// Setup patterns
			if (patterns.includes('setup')) {
				response.setup = `# Sveltest Setup Guide

## Install Dependencies
\`\`\`bash
# Add vitest browser playwright provider, Svelte testing and playwright (Vitest v4)
pnpm install -D @vitest/browser-playwright vitest-browser-svelte playwright

# remove testing library and jsdom
pnpm un @testing-library/jest-dom @testing-library/svelte jsdom
\`\`\`

## Configure Vitest Browser Mode
Update your \`vite.config.ts\`:

\`\`\`typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	test: {
		projects: [
			{
				// Client-side tests (Svelte components)
				extends: true,
				test: {
					name: 'client',
					testTimeout: 2000,
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [
							{ browser: 'chromium' },
							// { browser: 'firefox' },
							// { browser: 'webkit' },
						],
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: [
						'src/lib/server/**',
						'src/**/*.ssr.{test,spec}.{js,ts}',
					],
					setupFiles: ['./src/vitest-setup-client.ts'],
				},
			},
			{
				// SSR tests (Server-side rendering)
				extends: true,
				test: {
					name: 'ssr',
					environment: 'node',
					include: ['src/**/*.ssr.{test,spec}.{js,ts}'],
				},
			},
			{
				// Server-side tests (Node.js utilities)
				extends: true,
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: [
						'src/**/*.svelte.{test,spec}.{js,ts}',
						'src/**/*.ssr.{test,spec}.{js,ts}',
					],
				},
			},
		],
		coverage: {
			include: ['src'],
		},
	},
});
\`\`\`

## Setup File
Create \`src/vitest-setup-client.ts\`:

\`\`\`typescript
/// <reference types="vitest/browser" />
/// <reference types="@vitest/browser-playwright" />
\`\`\``;
			}

			// Component testing patterns
			if (patterns.includes('component-testing')) {
				response['component-testing'] = `# Component Testing Patterns

## Foundation First Template
\`\`\`typescript
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import MyComponent from './my-component.svelte';

describe('MyComponent', () => {
	describe('Initial Rendering', () => {
		it('should render with default props', async () => {
			const children = createRawSnippet(() => ({
				render: () => \`<span>Default content</span>\`,
			}));

			render(MyComponent, { children });

			const element = page.getByText('Default content');
			await expect.element(element).toBeInTheDocument();
		});

		it('should render with all prop variants', async () => {
			// Test different prop combinations
		});
	});

	describe('User Interactions', () => {
		it('should handle click events', async () => {
			const click_handler = vi.fn();
			const children = createRawSnippet(() => ({
				render: () => \`<span>Click me</span>\`,
			}));

			render(MyComponent, { onclick: click_handler, children });

			const button = page.getByRole('button', { name: 'Click me' });
			await button.click();

			expect(click_handler).toHaveBeenCalledOnce();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data gracefully', async () => {
			// Test edge cases
		});
	});
});
\`\`\`

## Testing Conditional Rendering
\`\`\`typescript
it('should show error message when invalid', async () => {
	render(MyComponent, {
		error: 'Invalid email format',
	});

	await expect
		.element(page.getByText('Invalid email format'))
		.toBeInTheDocument();
});
\`\`\`

## Testing Loading States
\`\`\`typescript
it('should show loading state', async () => {
	const children = createRawSnippet(() => ({
		render: () => \`<span>Loading...</span>\`,
	}));

	render(MyButton, { loading: true, children });

	await expect.element(page.getByRole('button')).toBeDisabled();
	await expect
		.element(page.getByText('Loading...'))
		.toBeInTheDocument();
});
\`\`\``;
			}

			// Form testing patterns
			if (patterns.includes('form-testing')) {
				response['form-testing'] = `# Form Testing Patterns

## Testing Form Inputs
\`\`\`typescript
it('should handle form input', async () => {
	render(MyInput, { label: 'Email', type: 'email' });

	const input = page.getByLabel('Email');
	await input.fill('user@example.com');

	await expect.element(input).toHaveValue('user@example.com');
});
\`\`\`

## Testing Form Validation
\`\`\`typescript
it('should show validation errors', async () => {
	render(MyForm, { errors: { email: 'Required field' } });

	await expect.element(page.getByText('Required field')).toBeInTheDocument();
	const input = page.getByLabel('Email');
	await expect.element(input).toHaveAttribute('aria-invalid', 'true');
});
\`\`\`

## Testing Form Submission
\`\`\`typescript
it('should handle form submission', async () => {
	const submit_handler = vi.fn();
	render(MyForm, { onsubmit: submit_handler });

	const input = page.getByLabel('Email');
	await input.fill('test@example.com');

	const submit_button = page.getByRole('button', { name: 'Submit' });
	await submit_button.click();

	expect(submit_handler).toHaveBeenCalledWith({ email: 'test@example.com' });
});
\`\`\``;
			}

			// Locator patterns
			if (patterns.includes('locators')) {
				response.locators = `# Locator Hierarchy (Use in This Order)

## 1. Semantic Roles (Best for Accessibility)
\`\`\`typescript
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('link', { name: 'Home' });
\`\`\`

## 2. Labels (Good for Forms)
\`\`\`typescript
page.getByLabel('Email address');
page.getByLabel('Password');
\`\`\`

## 3. Text Content (Good for Unique Text)
\`\`\`typescript
page.getByText('Welcome back');
page.getByText('Error: Invalid credentials');
\`\`\`

## 4. Test IDs (Fallback for Complex Cases)
\`\`\`typescript
page.getByTestId('submit-button');
page.getByTestId('user-avatar');
\`\`\`

## Handling Multiple Elements
\`\`\`typescript
// ❌ FAILS: "strict mode violation" if multiple elements match
page.getByRole('link', { name: 'Home' });

// ✅ CORRECT: Use .first(), .nth(), .last() for multiple elements
page.getByRole('link', { name: 'Home' }).first();
page.getByRole('link', { name: 'Home' }).nth(1); // Second element (0-indexed)
page.getByRole('link', { name: 'Home' }).last();
\`\`\``;
			}

			// Svelte 5 Runes testing
			if (patterns.includes('runes-testing')) {
				response['runes-testing'] = `# Svelte 5 Runes Testing

## Testing $state
\`\`\`typescript
import { untrack, flushSync } from 'svelte';

it('should handle reactive state', () => {
	let count = $state(0);

	expect(untrack(() => count)).toBe(0);

	count = 5;
	flushSync(); // Ensure state updates
	expect(untrack(() => count)).toBe(10);
});
\`\`\`

## Testing $derived
\`\`\`typescript
it('should handle derived state', () => {
	let count = $state(0);
	let doubled = $derived(count * 2);

	expect(untrack(() => doubled)).toBe(0);

	count = 5;
	flushSync(); // Ensure derived state updates
	expect(untrack(() => doubled)).toBe(10);
});
\`\`\`

## Testing $effect
\`\`\`typescript
it('should handle side effects', async () => {
	const effect_fn = vi.fn();
	
	$effect(() => {
		effect_fn();
	});

	flushSync();
	expect(effect_fn).toHaveBeenCalledOnce();
});
\`\`\`

## Testing Snippets
\`\`\`typescript
it('should render with snippets', async () => {
	const children = createRawSnippet(() => ({
		render: () => \`<span>Snippet content</span>\`,
	}));

	render(MyComponent, { children });

	await expect.element(page.getByText('Snippet content')).toBeInTheDocument();
});
\`\`\``;
			}

			// Mocking patterns
			if (patterns.includes('mocking')) {
				response.mocking = `# Mocking Patterns

## Mock Verification Pattern
\`\`\`typescript
describe('Mock Verification', () => {
	it('should have utility functions mocked correctly', async () => {
		const { my_util_function } = await import('$lib/utils/my-utils');

		expect(my_util_function).toBeDefined();
		expect(vi.isMockFunction(my_util_function)).toBe(true);
	});
});
\`\`\`

## Mocking with Correct Signatures
\`\`\`typescript
// ❌ WRONG: Wrong signature
vi.mock('$lib/utils', () => ({
	my_function: vi.fn(),
}));

// ✅ CORRECT: Correct signature
vi.mock('$lib/utils', () => ({
	my_function: vi.fn((param1: string, param2: number) => 'result'),
}));
\`\`\`

## Mocking API Calls
\`\`\`typescript
it('should handle API responses', async () => {
	vi.mock('$lib/api', () => ({
		fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'John' }),
	}));

	const { fetchUser } = await import('$lib/api');
	const user = await fetchUser(1);

	expect(user).toEqual({ id: 1, name: 'John' });
});
\`\`\``;
			}

			// Troubleshooting
			if (patterns.includes('troubleshooting')) {
				response.troubleshooting = `# Common Issues and Solutions

## "strict mode violation: getByRole() resolved to X elements"
**Problem**: Multiple elements match your locator

**Solution**: Target specific element
\`\`\`typescript
// ❌ FAILS: Multiple nav links (desktop + mobile)
page.getByRole('link', { name: 'Home' });

// ✅ WORKS: Target specific element
page.getByRole('link', { name: 'Home' }).first();
\`\`\`

## "My test is hanging, what's wrong?"
**Problem**: Usually caused by clicking form submit buttons with SvelteKit enhance

**Solution**: Test form state directly
\`\`\`typescript
// ❌ Can hang with SvelteKit forms
await submit_button.click();

// ✅ Test the state directly
render(MyForm, { errors: { email: 'Required' } });
await expect.element(page.getByText('Required')).toBeInTheDocument();
\`\`\`

## "Expected 2 arguments, but got 0"
**Problem**: Mock function signature doesn't match the real function

**Solution**: Match the correct signature
\`\`\`typescript
// ❌ WRONG: Missing parameters
vi.mock('$lib/utils', () => ({
	my_function: vi.fn(),
}));

// ✅ CORRECT: Include parameters
vi.mock('$lib/utils', () => ({
	my_function: vi.fn((param1: string, param2: number) => 'result'),
}));
\`\`\`

## Role and Element Confusion
\`\`\`typescript
// ❌ WRONG: Looking for link when element has role="button"
page.getByRole('link', { name: 'Submit' }); // <a role="button">Submit</a>

// ✅ CORRECT: Use the actual role
page.getByRole('button', { name: 'Submit' });

// ❌ WRONG: Input role doesn't exist
page.getByRole('input', { name: 'Email' });

// ✅ CORRECT: Use textbox for input elements
page.getByRole('textbox', { name: 'Email' });
\`\`\``;
			}

			// Best practices
			if (patterns.includes('best-practices')) {
				response['best-practices'] = `# Sveltest Best Practices

## The Golden Rule: Always Use Locators
Following the official Vitest Browser documentation, always use locators for reliable, auto-retrying queries:

\`\`\`typescript
// ✅ DO: Use page locators (auto-retry, semantic)
const button = page.getByRole('button', { name: 'Submit'' });
await button.click();

// ❌ DON'T: Use containers (no auto-retry, manual queries)
const { container } = render(MyComponent);
const button = container.querySelector('button');
\`\`\`

## Client-Server Alignment Strategy
The Four-Layer Approach:
1. **Shared Validation Logic**: Use the same validation functions on both client and server
2. **Real FormData/Request Objects**: Server tests use real web APIs, not mocks
3. **TypeScript Contracts**: Shared interfaces catch mismatches at compile time
4. **E2E Tests**: Final safety net for complete integration validation

## Test Structure Best Practices
\`\`\`typescript
describe('ComponentName', () => {
	describe('Initial Rendering', () => {
		it('should render with default props', async () => {
			// Test default state
		});
	});

	describe('User Interactions', () => {
		it('should handle click events', async () => {
			// Test user interactions
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty data gracefully', async () => {
			// Test edge cases
		});
	});

	describe('Accessibility', () => {
		it('should be accessible', async () => {
			// Test accessibility features
		});
	});
});
\`\`\`

## Performance Tips
- Use \`extends: true\` configuration for better performance
- Limit coverage scanning with \`coverage.include: ['src']\`
- Use multiple browser instances for parallel testing
- Test on a component basis for faster feedback loops

## Accessibility Testing
\`\`\`typescript
it('should be accessible', async () => {
	const children = createRawSnippet(() => ({
		render: () => \`<span>Submit</span>\`,
	}));

	render(MyComponent, { children });

	const button = page.getByRole('button', { name: 'Submit' });
	await expect.element(button).toHaveAttribute('aria-label');

	// Test keyboard navigation
	await page.keyboard.press('Tab');
	await expect.element(button).toBeFocused();
});
\`\`\``;
			}

			// Component-specific patterns
			if (component_type) {
				if (component_type === 'button') {
					response['component-specific'] = `# Button Component Testing

## Basic Button Test
\`\`\`typescript
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import MyButton from './my-button.svelte';

describe('MyButton', () => {
	it('should render with correct text', async () => {
		const children = createRawSnippet(() => ({
			render: () => \`<span>Click me</span>\`,
		}));

		render(MyButton, { children });

		const button = page.getByRole('button', { name: 'Click me' });
		await expect.element(button).toBeInTheDocument();
	});

	it('should handle click events', async () => {
		const click_handler = vi.fn();
		const children = createRawSnippet(() => ({
			render: () => \`<span>Click me</span>\`,
		}));

		render(MyButton, { onclick: click_handler, children });

		const button = page.getByRole('button', { name: 'Click me' });
		await button.click();

		expect(click_handler).toHaveBeenCalledOnce();
	});

	it('should apply correct variant class', async () => {
		const children = createRawSnippet(() => ({
			render: () => \`<span>Secondary</span>\`,
		}));

		render(MyButton, { variant: 'secondary', children });

		const button = page.getByTestId('my-button');
		await expect.element(button).toHaveClass('btn-secondary');
	});

	it('should be disabled when disabled prop is true', async () => {
		const children = createRawSnippet(() => ({
			render: () => \`<span>Disabled</span>\`,
		}));

		render(MyButton, { disabled: true, children });

		const button = page.getByRole('button', { name: 'Disabled' });
		await expect.element(button).toBeDisabled();
	});
});
\`\`\``;
				}

				if (component_type === 'form') {
					response['component-specific'] = `# Form Component Testing

## Form Component Test
\`\`\`typescript
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import MyForm from './my-form.svelte';

describe('MyForm', () => {
	it('should render form fields', async () => {
		render(MyForm);

		await expect.element(page.getByLabel('Email')).toBeInTheDocument();
		await expect.element(page.getByLabel('Password')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
	});

	it('should handle input changes', async () => {
		render(MyForm);

		const email_input = page.getByLabel('Email');
		await email_input.fill('test@example.com');

		await expect.element(email_input).toHaveValue('test@example.com');
	});

	it('should show validation errors', async () => {
		render(MyForm, { errors: { email: 'Invalid email' } });

		await expect.element(page.getByText('Invalid email')).toBeInTheDocument();
		await expect.element(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
	});

	it('should handle form submission', async () => {
		const submit_handler = vi.fn();
		render(MyForm, { onsubmit: submit_handler });

		await page.getByLabel('Email').fill('test@example.com');
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Submit' }).click();

		expect(submit_handler).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123'
		});
	});
});
\`\`\``;
				}
			}

			// Format the response
			const content = Object.entries(response)
				.map(([key, value]) => `## ${key}\n\n${value}`)
				.join('\n\n---\n\n');

			return {
				content: [
					{
						type: 'text',
						text: content,
					},
				],
			};
		},
	);
}