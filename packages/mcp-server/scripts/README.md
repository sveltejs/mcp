# Generate Summaries Script

This script generates short summaries for all Svelte 5 and SvelteKit documentation sections using the Anthropic API.

## Prerequisites

1. Make sure you have an Anthropic API key
2. Set the `ANTHROPIC_API_KEY` environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

Or add it to your `.env` file.

## Usage

From the root of the monorepo:

```bash
pnpm generate-summaries
```

Or directly from the `packages/mcp-server` directory:

```bash
pnpm run generate-summaries
```

## What it does

1. Fetches all available documentation sections from Svelte.dev
2. Downloads the content for each section from `https://svelte.dev/${section.slug}/llms.txt`
3. Sends each section to the Anthropic API using batch processing
4. Generates a short summary (max 150 characters) for each section
5. Saves the results to `packages/mcp-server/src/summary.json`

## Output Format

The script generates a JSON file with the following structure:

```json
{
  "generated_at": "2025-10-02T12:00:00.000Z",
  "model": "claude-3-5-sonnet-20241022",
  "total_sections": 150,
  "successful_summaries": 148,
  "failed_summaries": 2,
  "summaries": {
    "docs/svelte/$state": "Explains $state rune for reactive variables",
    "docs/svelte/$derived": "Guide to $derived rune for computed values",
    ...
  },
  "errors": [
    {
      "section": "Some Section",
      "error": "Error message"
    }
  ]
}
```

## Notes

- The script uses Claude 3.5 Sonnet for generating summaries
- Batch processing is used for efficiency
- The script will retry failed requests automatically
- Progress is displayed in the console during execution
