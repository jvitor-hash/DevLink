# AGENTS.md

## Project Overview

This is a bun project split between two folders, both of these are two different projects inside this main project, API/ as the name suggests the API of the application used to communicate with the database and resolve business logic. The other is FRONTEND/ the visual representation of the application, this directly communicate with the API/ at runtime to retrieve or send data and display it.
- FRONTEND/ React app; communicates with the API/ at runtime to read/write and display data.
- API/ Elysia backend; communicates with the database and resolves business logic.

## Environment

- **Bun**: >= 1.4.2
- **Package Manager**: bun (all npm packages installation must use `bun add`)
- **Framework**: React.js >= 19.2.8, Elysia >= 1.4.0
- **Programming Language**: Typescript
- **Database ORM**: Drizzle-ORM >= 1.0.0-rc.4
- **Database**: PostgreSQL >= 17

## Important: Always use `bun run`

This project uses `bun` for dependency management. **Never use bare `npm` or `npx` commands.** Always prefix NPM commands with `bun run`:

```bash
# Correct
bun run dev
bun run db:generate

# Incorrect
npm run start
```

## Setup commands

- Install deps: `bun install`
- Start dev server: `bun run dev`
- Run tests: `bun test` or `bun test --coverage`


## Testing instructions
- Fix any test or type errors until the whole suite is green.
- Add or update tests for the code you change, unless explicitly instructed to not to.

## Project Structure

DevLink
├── AGENTS.md
├── API
│   ├── bunfig.toml
│   ├── bun.lock
│   ├── docker-compose.yml
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── README.md
│   ├── src
│   └── tsconfig.json
├── FRONTEND
│   ├── bun.lock
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public
│   ├── README.md
│   ├── src
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── package.json
├── package-lock.json
└── README.md

## Code Conventions

- TypeScript strict mode
- Use functional patterns where possible
- ALWAYS provide type hints for every function.
- Avoid using helper functions and complex structures when something can easily be solved with a single function
- Avoid making elaborate comments, keep all of them simple and easy to understand within a single line at most unless it is required to explain futher. Keep all comments to a minimal only add if it is a piece of critical code.

## Code Style

Use PascalCase and make sure there is an empty whitespace between different context, always.

Bad Example:

```typescript
function my_function(some_parameter):
    if some_parameter === 'value':
        print(some_parameter)
        return some_parameter
```

Corrected Example:

```typescript
function myFunction(someParameter: string) : string {
    if (someParameter === 'value'):
        console.log(someParameter);
        
        return someParameter;
}
```

## Boundaries

- Never ever delete files with rm or similar commands
- Never use any git commands at all
- Never utilize install commands unless explicitly instructed
- Do not run destructive / hard-to-undo commands (git push, resets, deploys) without the user askins
