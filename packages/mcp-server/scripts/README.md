# Generate Use Cases Script

This script generates use case metadata for all Svelte 5 and SvelteKit documentation sections using the Anthropic API. The use cases describe when a documentation section would be useful for specific queries or project types.

## Setup

### 1. Install Dependencies

From the root of the monorepo:

```bash
pnpm install
```

### 2. Set Up API Key

You have two options:

**Option A: Using .env file (Recommended)**

1. Navigate to the `packages/mcp-server` directory:
   ```bash
   cd packages/mcp-server
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

**Option B: Export in terminal**

```bash
export ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

> **Get your API key**: Visit [https://console.anthropic.com/](https://console.anthropic.com/) to get your API key.

## Usage

From the root of the monorepo:

```bash
pnpm generate-summaries
```

Or directly from the `packages/mcp-server` directory:

```bash
cd packages/mcp-server
pnpm run generate-summaries
```

### Debug Mode

To test with only 2 sections:

```bash
DEBUG_MODE=1 pnpm generate-summaries
```

## What it does

1. ✅ Fetches all available documentation sections from Svelte.dev
2. ✅ Downloads the content for each section from `https://svelte.dev/${section.slug}/llms.txt`
3. ✅ Sends all sections to the Anthropic API using **batch processing** (efficient, not individual requests)
4. ✅ Generates use case metadata (max 200 characters) for each section using Claude Sonnet 4.5
5. ✅ Saves the results to `packages/mcp-server/src/summary.json`

## Use Cases Examples

The script generates metadata describing when documentation would be useful:

- **Core concepts**: "always, any svelte project, core reactivity"
- **Specific features**: "authentication, login systems, user management"
- **Project types**: "e-commerce, product listings, shopping carts"
- **Components**: "forms, user input, data submission"
- **Development stages**: "deployment, production builds, hosting setup"

## Output Format

The script generates a JSON file with the following structure:

```json
{
  "generated_at": "2025-10-02T12:00:00.000Z",
  "model": "claude-sonnet-4-5-20250929",
  "total_sections": 150,
  "successful_summaries": 148,
  "failed_summaries": 2,
  "summaries": {
    "docs/svelte/$state": "always, reactive state, variables, any svelte project",
    "docs/svelte/$derived": "computed values, derived state, reactive calculations",
    "docs/kit/routing": "navigation, multi-page apps, sveltekit projects"
  },
  "errors": [
    {
      "section": "Some Section",
      "error": "Error message"
    }
  ]
}
```

## Console Output

The script provides detailed console output with progress indicators:

```
🚀 Starting use cases generation...
📚 Fetching documentation sections...
Found 150 sections
📥 Downloading section content...
  Fetching 1/150: Overview
  Fetching 2/150: $state
  ...
✅ Successfully downloaded 150 sections
🤖 Initializing Anthropic API...
📦 Preparing batch requests...
🚀 Creating batch job...
✅ Batch created with ID: batch_abc123
⏳ Waiting for batch to complete...
  Progress: 50 succeeded, 100 processing, 0 errored
  Progress: 148 succeeded, 0 processing, 2 errored
✅ Batch processing completed!
📥 Downloading results...
📊 Processing results...
  ✅ Overview
  ✅ $state
  ...
💾 Writing results to file...

📊 Summary:
  Total sections: 150
  Successfully downloaded: 150
  Download failures: 0
  Successfully analyzed: 148
  Analysis failures: 2

✅ Results written to: packages/mcp-server/src/summary.json
```

## Notes

- The script uses **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) for generating use cases
- **Batch processing** is used for efficiency - all sections are sent in a single batch request
- The script will automatically retry failed API requests
- Progress is displayed in real-time in the console
- Batch processing typically takes 5-15 minutes depending on the number of sections
- Failed sections are logged and saved to the output JSON for review
- Use cases are limited to 200 characters and are comma-separated

## How It Works

The prompt instructs the LLM to analyze each documentation page and identify:

1. **Project types** where this documentation would be relevant (e.g., "e-commerce", "blog", "dashboard")
2. **Specific features** that would require this documentation (e.g., "authentication", "forms", "animations")
3. **Components** that would benefit from this documentation (e.g., "slider", "modal", "dropdown")
4. **Development stages** when this would be needed (e.g., "deployment", "testing", "migration")

The output is designed to help LLMs understand which documentation sections to fetch based on user queries like:
- "I need to build an e-commerce site"
- "I need to build a slider component"
- "I need to add authentication"
- "I need to deploy my app"
