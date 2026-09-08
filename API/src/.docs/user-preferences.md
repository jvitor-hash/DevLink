# User Preferences API

## Overview

The User Preferences API manages user notification settings. Each user can customize which types of notifications they receive. A unique constraint ensures one preference set per user.

**Base URL**: `/api/v1/user_preferences`

**Authentication**: Required (session cookie)

---

## Endpoints

### List All User Preferences

Retrieve a paginated list of all user preferences.

**Endpoint**: `GET /api/v1/user_preferences`

**Query Parameters**:
| Parameter | Type   | Default | Description                    |
|-----------|--------|---------|--------------------------------|
| `limit`   | number | 10      | Number of preferences (10-100) |
| `offset`  | number | 0       | Number to skip                 |

**Response** (200):
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "emailNotifications": true,
    "messageNotifications": true,
    "projectNotifications": true,
    "reviewNotifications": true,
    "createdAt": "2026-09-08T01:00:00Z",
    "updatedAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/user_preferences?limit=10&offset=0" \
  -b cookies.txt
```

---

### Create User Preference

Create notification preferences for a user.

**Endpoint**: `POST /api/v1/user_preferences`

**Request Body**:
```json
{
  "userId": "uuid",
  "emailNotifications": true,
  "messageNotifications": true,
  "projectNotifications": true,
  "reviewNotifications": true
}
```

**Field Requirements**:
| Field                  | Required | Default | Description                  |
|------------------------|----------|---------|------------------------------|
| `userId`               | Yes      | -       | UUID of the user             |
| `emailNotifications`   | No       | `true`  | Enable email notifications   |
| `messageNotifications` | No       | `true`  | Enable message notifications |
| `projectNotifications` | No       | `true`  | Enable project notifications |
| `reviewNotifications`  | No       | `true`  | Enable review notifications  |

**Response** (201):
```json
[
  {
    "id": "new_preference_uuid",
    "userId": "uuid",
    "emailNotifications": true,
    "messageNotifications": true,
    "projectNotifications": true,
    "reviewNotifications": true,
    "createdAt": "2026-09-08T01:00:00Z",
    "updatedAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/v1/user_preferences \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "fc314f89-fbc7-4ebe-b7b3-7a08b7e47418",
    "emailNotifications": true,
    "messageNotifications": true,
    "projectNotifications": false,
    "reviewNotifications": true
  }'
```

---

### Get User Preference by ID

Retrieve a single user preference by UUID.

**Endpoint**: `GET /api/v1/user_preferences/:id`

**Path Parameters**:
| Parameter | Type | Description     |
|-----------|------|-----------------|
| `id`      | uuid | Preference UUID |

**Response** (200):
```json
{
  "id": "preference_uuid",
  "userId": "uuid",
  "emailNotifications": true,
  "messageNotifications": true,
  "projectNotifications": true,
  "reviewNotifications": true,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T01:00:00Z"
}
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/user_preferences/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

### Update User Preference

Update notification preferences.

**Endpoint**: `PUT /api/v1/user_preferences/:id`

**Path Parameters**:
| Parameter | Type | Description     |
|-----------|------|-----------------|
| `id`      | uuid | Preference UUID |

**Request Body** (partial update):
```json
{
  "emailNotifications": false,
  "messageNotifications": false,
  "projectNotifications": true,
  "reviewNotifications": false
}
```

**Response** (200):
```json
{
  "id": "preference_uuid",
  "userId": "uuid",
  "emailNotifications": false,
  "messageNotifications": false,
  "projectNotifications": true,
  "reviewNotifications": false,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T02:00:00Z"
}
```

**Example**:
```bash
curl -X PUT "http://localhost:3333/api/v1/user_preferences/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": false,
    "messageNotifications": false
  }'
```

---

### Delete User Preference

Delete a user preference set.

**Endpoint**: `DELETE /api/v1/user_preferences/:id`

**Path Parameters**:
| Parameter | Type | Description     |
|-----------|------|-----------------|
| `id`      | uuid | Preference UUID |

**Response** (200):
```json
{
  "id": "deleted_preference_uuid",
  "userId": "uuid",
  "emailNotifications": false,
  "messageNotifications": false,
  "projectNotifications": true,
  "reviewNotifications": false,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T02:00:00Z"
}
```

**Example**:
```bash
curl -X DELETE "http://localhost:3333/api/v1/user_preferences/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

## Constraints

- **Unique Constraint**: Each user can only have one preference set
  - Constraint name: `user_preferences_user_unique`
  - Column: `userId`
  - Error: Duplicate creation attempts return 500 error

---

## Database Schema

```sql
CREATE TABLE "user_preference" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "email_notifications" boolean DEFAULT true NOT NULL,
  "message_notifications" boolean DEFAULT true NOT NULL,
  "project_notifications" boolean DEFAULT true NOT NULL,
  "review_notifications" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "user_preferences_user_unique" ON "user_preference" ("user_id");

ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
```
