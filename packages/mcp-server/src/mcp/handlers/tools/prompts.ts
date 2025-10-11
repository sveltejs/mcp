export const SECTIONS_LIST_INTRO =
	'List of available Svelte documentation sections with their intended use cases. The "use_cases" field describes WHEN each section would be useful - analyze these carefully to determine which sections match the user\'s query:';

export const SECTIONS_LIST_OUTRO =
	"Carefully analyze the use_cases field for each section to identify which documentation is relevant for the user's specific query. The use_cases contain keywords for project types, features, components, and development stages. After identifying relevant sections, use the get-documentation tool with ALL relevant section titles or paths at once (can pass multiple sections as an array).";

export const USE_CASES_PROMPT = `You are tasked with analyzing Svelte 5 and SvelteKit documentation pages to identify when they would be useful.

Your task:
1. Read the documentation page content provided
2. Identify the main use cases, scenarios, or queries where this documentation would be relevant
3. Create a VERY SHORT, comma-separated list of use cases (maximum 200 characters total)
4. Think about what a developer might be trying to build or accomplish when they need this documentation

Guidelines:
- Focus on WHEN this documentation would be needed, not WHAT it contains
- Consider specific project types (e.g., "e-commerce site", "blog", "dashboard", "social media app")
- Consider specific features (e.g., "authentication", "forms", "data fetching", "animations")
- Consider specific components (e.g., "slider", "modal", "dropdown", "card")
- Consider development stages (e.g., "project setup", "deployment", "testing", "migration")
- Use "always" for fundamental concepts that apply to virtually all Svelte projects
- Be concise but specific
- Use lowercase
- Separate multiple use cases with commas

Examples of good use_cases:
- "always, any svelte project, core reactivity"
- "authentication, login systems, user management"
- "e-commerce, product listings, shopping carts"
- "forms, user input, data submission"
- "deployment, production builds, hosting setup"
- "animation, transitions, interactive ui"
- "routing, navigation, multi-page apps"
- "blog, content sites, markdown rendering"

Requirements:
- Maximum 200 characters (including spaces and commas)
- Lowercase only
- Comma-separated list of use cases
- Focus on WHEN/WHY someone would need this, not what it is
- Be specific about project types, features, or components when applicable
- Use "always" sparingly, only for truly universal concepts
- Do not include quotes or special formatting in your response
- Respond with ONLY the use cases text, no additional text

Here is the documentation page content to analyze:
`;

export const DISTILLED_PROMPT = `You are an expert in web development, specifically Svelte 5 and SvelteKit. Your task is to condense and distill the Svelte documentation into a concise format while preserving the most important information.
Shorten the text information AS MUCH AS POSSIBLE while covering key concepts.

Focus on:
1. Code examples with short explanations of how they work
2. Key concepts and APIs with their usage patterns
3. Important gotchas and best practices
4. Patterns that developers commonly use

Remove:
1. Redundant explanations
2. Verbose content that can be simplified
3. Marketing language
4. Legacy or deprecated content
5. Anything else that is not strictly necessary

Keep your output in markdown format. Preserve code blocks with their language annotations.
Maintain headings but feel free to combine or restructure sections to improve clarity.

Make sure all code examples use Svelte 5 runes syntax ($state, $derived, $effect, etc.)

Keep the following Svelte 5 syntax rules in mind:
* There is no colon (:) in event modifiers. You MUST use "onclick" instead of "on:click".
* Runes do not need to be imported, they are globals. 
* $state() runes are always declared using let, never with const. 
* When passing a function to $derived, you must always use $derived.by(() => ...). 
* Error boundaries can only catch errors during component rendering and at the top level of an $effect inside the error boundary.
* Error boundaries do not catch errors in onclick or other event handlers.

IMPORTANT: All code examples MUST come from the documentation verbatim, do NOT create new code examples. Do NOT modify existing code examples.
IMPORTANT: Because of changes in Svelte 5 syntax, do not include content from your existing knowledge, you may only use knowledge from the documentation to condense.

Here is the documentation you must condense:
`;
