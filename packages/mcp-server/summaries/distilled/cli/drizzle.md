# Drizzle ORM

TypeScript ORM with relational and SQL-like query APIs, serverless-ready.

## Setup

```sh
npx sv add drizzle
```

**Includes:**
- Database access in SvelteKit server files
- `.env` for credentials
- Lucia auth compatibility
- Optional Docker config for local database

## Options

### database
Choose database variant:
- `postgresql` — popular open source
- `mysql` — popular open source  
- `sqlite` — file-based, no server needed

```sh
npx sv add drizzle=database:postgresql
```

### client
SQL client (depends on database):
- **postgresql**: `postgres.js`, `neon`
- **mysql**: `mysql2`, `planetscale`
- **sqlite**: `better-sqlite3`, `libsql`, `turso`

```sh
npx sv add drizzle=database:postgresql+client:postgres.js
```

*Note: Can swap for [other Drizzle-compatible drivers](https://orm.drizzle.team/docs/connect-overview#next-steps) after setup*

### docker
Add Docker Compose config (postgresql/mysql only):

```sh
npx sv add drizzle=database:postgresql+client:postgres.js+docker:yes
```