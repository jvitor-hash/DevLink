# Messages API

## Overview

The Messages API handles communication between users within projects. Messages are thread-like entries tied to specific projects and senders.

**Base URL**: `/api/v1/message/`

**Authentication**: Required (session cookie)

---

## Endpoints

### List All Messages

Retrieve a paginated list of all messages.

**Endpoint**: `GET /api/v1/message/`

**Query Parameters**:
| Parameter | Type   | Default | Description            |
|-----------|--------|---------|------------------------|
| `limit`   | number | 10 | Number of messages (10-100) |
| `offset`  | number | 0  | Number to skip              |

**Response** (200):
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "senderId": "uuid",
    "content": "Hello, this is a message",
    "isRead": false,
    "createdAt": "2026-09-08T01:00:00Z",
    "updatedAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/message/?limit=10&offset=0" \
  -b cookies.txt
```

---

### Create Message

Send a new message in a project.

**Endpoint**: `POST /api/v1/message/`

**Request Body**:
```json
{
  "projectId": "uuid",
  "senderId": "uuid",
  "content": "Hello, this is a message",
  "isRead": false
}
```

**Field Requirements**:
| Field       | Required  | Description                  |
|-------------|-----------|------------------------------|
| `projectId` | Yes       | UUID of the project          |
| `senderId`  | Yes       | UUID of the sending user     |
| `content`   | Yes       | Message content (min 1 char) |
| `isRead`    | No        | Read status (default: false) |

**Response** (201):
```json
[
  {
    "id": "new_message_uuid",
    "projectId": "uuid",
    "senderId": "uuid",
    "content": "Hello, this is a message",
    "isRead": false,
    "createdAt": "2026-09-08T01:00:00Z",
    "updatedAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/v1/message/ \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "senderId": "fc314f89-fbc7-4ebe-b7b3-7a08b7e47418",
    "content": "Hello, this is a message"
  }'
```

---

### Get Message by ID

Retrieve a single message by UUID.

**Endpoint**: `GET /api/v1/message/:id`

**Path Parameters**:
| Parameter | Type | Description  |
|-----------|------|--------------|
| `id`      | uuid | Message UUID |

**Response** (200):
```json
{
  "id": "message_uuid",
  "projectId": "uuid",
  "senderId": "uuid",
  "content": "Hello, this is a message",
  "isRead": false,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
```json
{ "error": "Failed to fetch message" }
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/message/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

### Update Message

Update message content or read status.

**Endpoint**: `PUT /api/v1/message/:id`

**Path Parameters**:
| Parameter | Type | Description  |
|-----------|------|--------------|
| `id`      | uuid | Message UUID |

**Request Body** (partial update):
```json
{
  "content": "Updated message content",
  "isRead": true
}
```

**Response** (200):
```json
{
  "id": "message_uuid",
  "projectId": "uuid",
  "senderId": "uuid",
  "content": "Updated message content",
  "isRead": true,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T02:00:00Z"
}
```

**Example**:
```bash
curl -X PUT "http://localhost:3333/api/v1/message/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated message content", "isRead": true}'
```

---

### Delete Message

Delete a message permanently.

**Endpoint**: `DELETE /api/v1/message/:id`

**Path Parameters**:
| Parameter | Type | Description  |
|-----------|------|--------------|
| `id`      | uuid | Message UUID |

**Response** (200):
```json
{
  "id": "deleted_message_uuid",
  "projectId": "uuid",
  "senderId": "uuid",
  "content": "Deleted message",
  "isRead": false,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
```json
{ "error": "Failed to delete message" }
```

**Example**:
```bash
curl -X DELETE "http://localhost:3333/api/v1/message/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

## Error Responses

| Code | Message                  | Description                            |
|------|--------------------------|----------------------------------------|
| 404  | Failed to fetch message  | Message not found                      |
| 404  | Failed to update message | Message not found                      |
| 404  | Failed to delete message | Message not found                      |
| 500  | Failed to create message | Database error or constraint violation |
