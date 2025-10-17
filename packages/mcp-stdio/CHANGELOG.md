# @sveltejs/mcp

## 0.1.8

### Patch Changes

- fix: upgrade registry publisher cli ([`5fa2baa`](https://github.com/sveltejs/mcp/commit/5fa2baa27009f01e0e4e91cee7984b81a81c1c29))

## 0.1.7

### Patch Changes

- fix: use correct server schema version ([`579be87`](https://github.com/sveltejs/mcp/commit/579be877fa9f87f7f173450ca5bc918824d68282))

## 0.1.6

### Patch Changes

- fix: prevent `imported_runes` suggestion from being added for libs that are not svelte ([`87af64f`](https://github.com/sveltejs/mcp/commit/87af64f4bc6d07b75640eb987a33655654363997))

- feat: add svelte icon and website url for mcp server ([#75](https://github.com/sveltejs/mcp/pull/75))

- fix: use `data:` uri for local icon & add icons to tools + resources + prompts ([`cf62286`](https://github.com/sveltejs/mcp/commit/cf622869129382a97ad059bb1389f115907adc8e))

## 0.1.5

### Patch Changes

- fix: widen `desired_svelte_version` validation to accommodate some clients ([`3b301d7`](https://github.com/sveltejs/mcp/commit/3b301d7d9c2f49758023408f505bc4ca79caaff4))

- fix: minor tweaks to the prompt to allow for automatic sync ([#63](https://github.com/sveltejs/mcp/pull/63))

- feat: `read_state_with_dollar` autofixer ([#66](https://github.com/sveltejs/mcp/pull/66))

## 0.1.4

### Patch Changes

- fix: pass secrets in action and update `mcpName` ([`044f098`](https://github.com/sveltejs/mcp/commit/044f0988b935fff39911a861a648dfb276f5831a))

## 0.1.3

### Patch Changes

- fix: use DNS to publish MCP ([#59](https://github.com/sveltejs/mcp/pull/59))

## 0.1.2

### Patch Changes

- fix: publish to MCP registry (I really hope this time for real) ([`ef5241c`](https://github.com/sveltejs/mcp/commit/ef5241cbc204ad8bb84bde27db7c9d0a08280245))

## 0.1.1

### Patch Changes

- feat: publish mcp to registry (maybe for real this time) ([`132943d`](https://github.com/sveltejs/mcp/commit/132943db3b04dbbd322d08926c0880c990a61f5f))

## 0.1.0

### Minor Changes

- feat: publish to registry ([#45](https://github.com/sveltejs/mcp/pull/45))

### Patch Changes

- feat: add autofixer to tell the LLM to check if some function called in effect is assigning state #26 ([`73d7625`](https://github.com/sveltejs/mcp/commit/73d7625b3ca6a812ba91883ea668d80ff1e7c703))

- feat: add bind:this -> attachment and action -> attachment autofixer #20 ([`73d7625`](https://github.com/sveltejs/mcp/commit/73d7625b3ca6a812ba91883ea668d80ff1e7c703))

## 0.0.4

### Patch Changes

- fix: allow TS `.svelte.ts` modules ([#49](https://github.com/sveltejs/mcp/pull/49))

## 0.0.3

### Patch Changes

- fix: check effect.pre in assign-in-effect ([#41](https://github.com/sveltejs/mcp/pull/41))

- feat: `use_cases` documentation metadata ([#29](https://github.com/sveltejs/mcp/pull/29))

- fix: change title names to allow for claude code to use the prompt ([`725f785`](https://github.com/sveltejs/mcp/commit/725f785766d04e9ed810a7c3f6bcfdb2e2b8234c))

- fix: enable doc tools ([`cb316c5`](https://github.com/sveltejs/mcp/commit/cb316c5b3ebc712946969d2d57236d159e796d58))

## 0.0.2

### Patch Changes

- feat: latest version ([#25](https://github.com/sveltejs/mcp/pull/25))
