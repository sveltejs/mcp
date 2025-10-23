# {@debug}

Logs variable values when they change and pauses execution if devtools open.

## Usage

```svelte
<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

{@debug user}

<h1>Hello {user.firstname}!</h1>
```

## Syntax Rules

**Accepts:** Comma-separated variable names only
**Rejects:** Expressions, property access, array indices, operators

```svelte
<!-- ✓ Valid -->
{@debug user}
{@debug user1, user2, user3}

<!-- ✗ Invalid -->
{@debug user.firstname}
{@debug myArray[0]}
{@debug !isReady}
{@debug typeof user === 'object'}
```

**No arguments:** `{@debug}` triggers on any state change