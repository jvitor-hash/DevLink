# Saved Tickets API

## Overview

The Saved Tickets API allows users to bookmark/save projects for later reference. A saved ticket represents a user-project relationship and prevents duplicate saves via a unique constraint.

**Base URL**: `/api/v1/saved_ticket`

**Authentication**: Required (session cookie)

---

## Endpoints

### List All Saved Tickets

Retrieve a paginated list of all saved tickets.

**Endpoint**: `GET /api/v1/saved_ticket`

**Query Parameters**:
| Parameter | Type   | Default | Description                |
|-----------|--------|---------|----------------------------|
| `limit`   | number | 10      | Number of tickets (10-100) |
| `offset`  | number | 0       | Number to skip             |

**Response** (200):
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "projectId": "uuid",
    "createdAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/saved_ticket?limit=10&offset=0" \
  -b cookies.txt
```

---

### Create Saved Ticket

Save/bookmark a project for a user.

**Endpoint**: `POST /api/v1/saved_ticket`

**Request Body**:
```json
{
  "userId": "uuid",
  "projectId": "uuid"
}
```

**Field Requirements**:
| Field       | Required | Description                        |
|-------------|----------|------------------------------------|
| `userId`    | Yes      | UUID of the user saving the ticket |
| `projectId` | Yes      | UUID of the project to save        |

**Response** (201):
```json
[
  {
    "id": "new_ticket_uuid",
    "userId": "uuid",
    "projectId": "uuid",
    "createdAt": "2026-09-08T01:00:00Z"
  }
]
```

**Error Response** (500 - Duplicate):
If the user already saved this project, a unique constraint violation occurs:
```json
{ "error": "Failed to create saved ticket" }
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/v1/saved_ticket \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "fc314f89-fbc7-4ebe-b7b3-7a08b7e47418",
    "projectId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

### Get Saved Ticket by ID

Retrieve a single saved ticket by UUID.

**Endpoint**: `GET /api/v1/saved_ticket/:id`

**Path Parameters**:
| Parameter | Type | Description       |
|-----------|------|-------------------|
| `id`      | uuid | Saved ticket UUID |

**Response** (200):
```json
{
  "id": "ticket_uuid",
  "userId": "uuid",
  "projectId": "uuid",
  "createdAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
The route returns an empty array when not found (findWhere throws on null).

**Example**:
```bash
curl "http://localhost:3333/api/v1/saved_ticket/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

### Delete Saved Ticket

Remove a saved ticket.

**Endpoint**: `DELETE /api/v1/saved_ticket/:id`

**Path Parameters**:
| Parameter | Type | Description       |
|-----------|------|-------------------|
| `id`      | uuid | Saved ticket UUID |

**Response** (200):
```json
{
  "id": "deleted_ticket_uuid",
  "userId": "uuid",
  "projectId": "uuid",
  "createdAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
The route returns empty result when trying to delete non-existent ticket.

**Example**:
```bash
curl -X DELETE "http://localhost:3333/api/v1/saved_ticket/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

## Constraints

- **Unique Constraint**: A user can only save a project once
  - Constraint name: `saved_ticket_user_project_unique`
  - Columns: `(userId, projectId)`
  - Error: Duplicate attempts return 500 error

---

## Database Schema

```sql
CREATE TABLE "saved_ticket" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "project_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "saved_ticket_user_project_unique" ON "saved_ticket" ("user_id", "project_id");
CREATE INDEX "saved_tickets_user_id_idx" ON "saved_ticket" ("user_id");
CREATE INDEX "saved_tickets_project_id_idx" ON "saved_ticket" ("project_id");

ALTER TABLE "saved_ticket" ADD CONSTRAINT "saved_ticket_user_id_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;

ALTER TABLE "saved_ticket" ADD CONSTRAINT "saved_ticket_project_id_project_id_fkey" 
  FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE;
```
