# AGENTS.md / API

## Project Overview

This is a Elysia application programming interface (API) with type hint provided by zod, the programming language used is typescript on strict mode. The database is postgreSQL with a database ORM drizzle-orm/drizzle-kit. 

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Bun
- **Testing Framework**: Bun

## Environment Setup

- **Bun**: >= 1.4.2
- **Package Manager**: bun (all npm packages installation must use `bun add`)

## Project Structure

API/
├── src
│   ├── auth.ts
│   ├── client.ts
│   ├── database
│   │   ├── data-transfer-object
│   │   ├── migrations
│   │   └── schema
│   ├── env.ts
│   ├── index.ts
│   ├── modules
│   │   ├── auth_plugin.ts
│   │   ├── crud_factory.ts
│   │   └── error_schema.ts
│   ├── routes
│   │   └── v1
│   │       ├── message
│   │       │   ├── index.ts
│   │       │   └── service.ts
│   │       ├── notification
│   │       │   ├── index.ts
│   │       │   └── service.ts
│   │       ├── projects
│   │       │   ├── index.ts
│   │       │   └── service.ts
│   │       ├── review
│   │       │   ├── index.ts
│   │       │   └── service.ts
│   │       ├── saved_ticket
│   │       │   ├── index.ts
│   │       │   └── service.ts
│   │       └── user_preferences
│   │           ├── index.ts
│   │           └── service.ts
│   └── tests
│       ├── auth.test.ts
│       ├── enums.test.ts
│       ├── health.test.ts
│       ├── message.test.ts
│       ├── notification.test.ts
│       ├── projects.test.ts
│       ├── review.test.ts
│       ├── routes.test.ts
│       ├── saved_ticket.test.ts
│       ├── setup.ts
│       └── user_preferences.test.ts
├── AGENTS.md
├── bunfig.toml
├── docker-compose.yml
├── drizzle.config.ts
├── package.json
├── README.md
└── tsconfig.json

## Elysia Documentation

When working on Elysia code, consult the official Elysia documentation first:

- Core concepts: https://elysiajs.com/key-concept
- Essential concepts: https://elysiajs.com/table-of-content
- Validation: https://elysiajs.com/essential/validation
- Plugins: https://elysiajs.com/essential/plugin
- Lifecycle: https://elysiajs.com/tutorial/getting-started/life-cycle/
- TypeScript: https://elysiajs.com/patterns/typescript

### Elysia Conventions

Prefer schema-driven APIs

Use Zod's `z` schemas for request and response validation when appropriate:

```typescript
// routes/v1/projects/index.ts
import { ProjectService } from "./service";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";
import { z } from "zod";

export const ProjectsRouter = new Elysia({ prefix: "/api/v1/projects" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as ProjectCreate;
      const newProject = await ProjectService.create({
        ...data,
        clientId: schemas.user.id,
      });
      set.status = 201;
      return newProject;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create project" };
    }
  }, {
    body: ProjectCreateSchema,
    response: {
      201: ProjectDTOSchema,
      500: ErrorSchema,
    },
    tags: ["Projects"],
    auth: true,
  })
```

Schemas provide runtime validation and TypeScript inference from the same definition.
Elysia supports validation for `body`, `query`, `params`, `headers`, `cookie`, and `response`.

Do not duplicate types manually when they can be inferred from an existing Elysia schema.

### Preserve method chaining

Prefer chained Elysia APIs:

```typescript
const app = new Elysia()
  .state('config', config)
  .get('/', handler)
  .post('/users', createUser)
  .listen(3000);
```

Avoid breaking chains when introducing typed state, decorators, or other Elysia extensions. Elysia's type inference relies heavily on the resulting instance type, and method chaining preserves those inferred types.

### Use plugins for reusable functionality

Encapsulate independent features in Elysia instances and compose them with .use():

```typescript
const auth = new Elysia()
  .decorate('auth', authService)

const app = new Elysia()
  .use(auth)
```

Keep plugin concerns isolated and be aware that lifecycle hooks are scoped to their Elysia instance unless explicitly configured otherwise.

### Prefer inferred TypeScript types

Elysia has first-class TypeScript support. Let schemas and the Elysia instance provide request/response types instead of adding redundant annotations.

When exposing the API to a TypeScript client, export the Elysia app type:

```typescript
export type App = typeof app
```

### Before Making Architectural Changes

Check the Elysia documentation for an existing pattern before introducing custom infrastructure. In particular, look at:

- Plugins for reusable functionality.
- Lifecycle hooks for request/response interception.
- Elysia.t or Standard Schema for validation.

Elysia integrations before writing framework-specific adapters.

## Unit Testing

Important: Testing is optional, unless explicitly told otherwise.

```tsx
// tests/message.test.tsx
import { describe, expect, test } from "bun:test";
import { MessageCreateSchema, MessageUpdateSchema, MessageSchema } from "../database/data-transfer-object/message_dto";
import { MessageRouter } from "../routes/v1/message";

describe("Message Schema Validation", () => {
  test("MessageCreateSchema should validate message payload", () => {
    const validData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Hello, this is a test message",
    };

    const result = MessageCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.data.content).toBe("Hello, this is a test message");
    }
  });

  test("MessageCreateSchema should validate with default isRead", () => {
    const validData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      content: "Message with default isRead",
    };

    const result = MessageCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRead).toBe(false);
    }
  });

  test("MessageCreateSchema should reject empty content", () => {
    const invalidData = {
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      content: "",
    };

    const result = MessageCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("MessageCreateSchema should reject invalid project UUID", () => {
    const invalidData = {
      projectId: "invalid-uuid",
      content: "Test message",
    };

    const result = MessageCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("MessageCreateSchema should reject missing required fields", () => {
    const invalidData = {};

    const result = MessageCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("MessageUpdateSchema should accept partial updates", () => {
    const updateData = {
      content: "Updated message content",
    };

    const result = MessageUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("Updated message content");
    }
  });

  test("MessageUpdateSchema should accept isRead update", () => {
    const updateData = {
      isRead: true,
    };

    const result = MessageUpdateSchema.safeParse(updateData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isRead).toBe(true);
    }
  });

  test("MessageUpdateSchema should accept empty update", () => {
    const emptyUpdate = {};

    const result = MessageUpdateSchema.safeParse(emptyUpdate);
    expect(result.success).toBe(true);
  });

  test("MessageSchema should validate full entity", () => {
    const fullMessage = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      senderId: "550e8400-e29b-41d4-a716-446655440002",
      content: "Full message content",
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = MessageSchema.safeParse(fullMessage);
    expect(result.success).toBe(true);
  });

  test("MessageSchema should validate entity with isRead true", () => {
    const readMessage = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      projectId: "550e8400-e29b-41d4-a716-446655440001",
      senderId: "550e8400-e29b-41d4-a716-446655440002",
      content: "Read message",
      isRead: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = MessageSchema.safeParse(readMessage);
    expect(result.success).toBe(true);
  });
});

describe("Message Route Definition", () => {
  test("MessageRouter is properly configured", () => {
    expect(MessageRouter).toBeDefined();
    expect(typeof MessageRouter.prefix).toBe("function");
  });
});
```

## Boundaries

- Do not alter the file inside database/schema/index.ts
