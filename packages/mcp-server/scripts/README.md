# Generate Summaries Script

This script generates short summaries for all Svelte 5 and SvelteKit documentation sections using the Anthropic API.

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

## What it does

1. ✅ Fetches all available documentation sections from Svelte.dev
2. ✅ Downloads the content for each section from `https://svelte.dev/${section.slug}/llms.txt`
3. ✅ Sends all sections to the Anthropic API using **batch processing** (efficient, not individual requests)
4. ✅ Generates a short summary (max 150 characters) for each section using Claude 3.5 Sonnet
5. ✅ Saves the results to `packages/mcp-server/src/summary.json`

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
    "docs/kit/routing": "Guide to routing in SvelteKit applications"
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
🚀 Starting summary generation...
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
  Successfully summarized: 148
  Failed: 2

✅ Results written to: packages/mcp-server/src/summary.json
```

## Notes

- The script uses **Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`) for generating summaries
- **Batch processing** is used for efficiency - all sections are sent in a single batch request
- The script will automatically retry failed API requests
- Progress is displayed in real-time in the console
- Batch processing typically takes 5-15 minutes depending on the number of sections
- Failed sections are logged and saved to the output JSON for review
