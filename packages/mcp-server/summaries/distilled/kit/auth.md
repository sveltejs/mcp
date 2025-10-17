# Auth

Authentication verifies user identity via credentials. Authorization determines allowed actions.

## Sessions vs Tokens

**Sessions:**
- Stored in database
- Can be immediately revoked
- Require DB query per request

**JWT:**
- Not checked against datastore
- Cannot be immediately revoked
- Better latency, reduced DB load

## Integration

- Check auth [cookies](@sveltejs-kit#Cookies) in [server hooks](hooks#Server-hooks)
- Store user info in [`locals`](hooks#Server-hooks-locals)

## Implementation

[Lucia](https://lucia-auth.com/) provides session-based auth examples for SvelteKit.

Add via:
- `npx sv create` (new project)
- `npx sv add lucia` (existing project)

SvelteKit-specific guides preferred over generic JS auth libraries to avoid multiple framework dependencies.