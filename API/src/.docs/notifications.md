# Notifications API

## Overview

The Notifications API manages user notifications for various events in the system. Notifications are user-specific and track read/unread status.

**Base URL**: `/api/v1/notification`

**Authentication**: Required (session cookie)

---

## Endpoints

### List All Notifications

Retrieve a paginated list of all notifications (for the authenticated user context).

**Endpoint**: `GET /api/v1/notification`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Number of notifications (10-100) |
| `offset` | number | 0 | Number to skip |

**Response** (200):
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "NEW_MESSAGE",
    "title": "New Message",
    "message": "You received a new message",
    "projectId": "uuid|null",
    "isRead": false,
    "createdAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/notification?limit=10&offset=0" \
  -b cookies.txt
```

---

### Create Notification

Create a new notification.

**Endpoint**: `POST /api/v1/notification`

**Request Body**:
```json
{
  "userId": "uuid",
  "type": "NEW_MESSAGE",
  "title": "New Message",
  "message": "You have received a new message",
  "projectId": "uuid|null",
  "isRead": false
}
```

**Field Requirements**:
| Field | Required | Description |
|-------|----------|-------------|
| `userId` | Yes | UUID of the user to notify |
| `type` | Yes | Notification type enum |
| `title` | Yes | Notification title (max 200 chars) |
| `message` | Yes | Notification message body |
| `projectId` | No | Associated project UUID (optional) |
| `isRead` | No | Read status (default: false) |

**Response** (201):
```json
[
  {
    "id": "new_notification_uuid",
    "userId": "uuid",
    "type": "NEW_MESSAGE",
    "title": "New Message",
    "message": "You have received a new message",
    "projectId": null,
    "isRead": false,
    "createdAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/v1/notification \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "fc314f89-fbc7-4ebe-b7b3-7a08b7e47418",
    "type": "NEW_MESSAGE",
    "title": "New Message",
    "message": "You have received a new message",
    "isRead": false
  }'
```

---

### Get Notification by ID

Retrieve a single notification by UUID.

**Endpoint**: `GET /api/v1/notification/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Notification UUID |

**Response** (200):
```json
{
  "id": "notification_uuid",
  "userId": "uuid",
  "type": "NEW_MESSAGE",
  "title": "New Message",
  "message": "You have received a new message",
  "projectId": null,
  "isRead": false,
  "createdAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
```json
{ "error": "Notification not found" }
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/notification/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

### Update Notification

Update notification properties (e.g., mark as read).

**Endpoint**: `PUT /api/v1/notification/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Notification UUID |

**Request Body** (partial update):
```json
{
  "title": "Updated Title",
  "isRead": true,
  "message": "Updated message body"
}
```

**Response** (200):
```json
{
  "id": "notification_uuid",
  "userId": "uuid",
  "type": "NEW_MESSAGE",
  "title": "Updated Title",
  "message": "Updated message body",
  "projectId": null,
  "isRead": true,
  "createdAt": "2026-09-08T01:00:00Z"
}
```

**Example**:
```bash
# Mark as read
curl -X PUT "http://localhost:3333/api/v1/notification/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"isRead": true}'
```

---

### Delete Notification

Delete a notification permanently.

**Endpoint**: `DELETE /api/v1/notification/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Notification UUID |

**Response** (200):
```json
{
  "id": "deleted_notification_uuid",
  "userId": "uuid",
  "type": "NEW_MESSAGE",
  "title": "Deleted Notification",
  "message": "...",
  "projectId": null,
  "isRead": false,
  "createdAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
```json
{ "error": "Notification not found" }
```

**Example**:
```bash
curl -X DELETE "http://localhost:3333/api/v1/notification/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

## Notification Types

| Type | Description |
|------|-------------|
| `NEW_MESSAGE` | New message in a project |
| `NEW_REVIEW` | New review on a project |
| `PROJECT_UPDATE` | Project status changed |
| `PROJECT_COMPLETED` | Project marked as completed |
| `PROJECT_CANCELLED` | Project cancelled |
| `TICKET_SAVED` | Project saved to bookmarks |
| `SYSTEM` | System-generated notification |
