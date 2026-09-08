# Projects API

## Overview

The Projects API allows clients to create, read, update, and delete project listings. Projects are the core entity representing work opportunities.

**Base URL**: `/api/v1/projects`

**Authentication**: Required (session cookie)

---

## Endpoints

### List All Projects

Retrieve a paginated list of all projects.

**Endpoint**: `GET /api/v1/projects`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 10 | Number of projects to return (10-100) |
| `offset` | number | 0 | Number of projects to skip |

**Response** (200):
```json
[
  {
    "id": "uuid",
    "clientId": "uuid",
    "programmerId": "uuid|null",
    "title": "Project Title",
    "description": "Project description",
    "category": "Web",
    "sub_category": "Full Stack",
    "primaryLanguage": "TYPESCRIPT",
    "platforms": ["WEB", "MOBILE"],
    "status": "OPEN",
    "completedAt": null,
    "createdAt": "2026-09-08T01:00:00Z",
    "updatedAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
# Get first 10 projects
curl "http://localhost:3333/api/v1/projects?limit=10&offset=0" \
  -b cookies.txt

# Get next 10 projects
curl "http://localhost:3333/api/v1/projects?limit=10&offset=10" \
  -b cookies.txt
```

---

### Create Project

Create a new project listing.

**Endpoint**: `POST /api/v1/projects`

**Request Body**:
```json
{
  "title": "E-commerce Website",
  "description": "Build a full-stack e-commerce platform",
  "category": "Web",
  "sub_category": "Full Stack",
  "primaryLanguage": "TYPESCRIPT",
  "platforms": ["WEB", "MOBILE"],
  "clientId": "uuid_of_client",
  "status": "OPEN"
}
```

**Field Requirements**:
| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Project title (max 200 chars) |
| `description` | Yes | Project description |
| `category` | Yes | Category (max 200 chars) |
| `sub_category` | Yes | Sub-category (max 200 chars) |
| `primaryLanguage` | Yes | Programming language enum |
| `platforms` | Yes | Array of platform types |
| `clientId` | Yes | UUID of the client user |
| `status` | No | Project status (default: "OPEN") |

**Response** (201):
```json
[
  {
    "id": "new_project_uuid",
    "clientId": "uuid_of_client",
    "programmerId": null,
    "title": "E-commerce Website",
    "description": "Build a full-stack e-commerce platform",
    "category": "Web",
    "sub_category": "Full Stack",
    "primaryLanguage": "TYPESCRIPT",
    "platforms": ["WEB", "MOBILE"],
    "status": "OPEN",
    "completedAt": null,
    "createdAt": "2026-09-08T01:00:00Z",
    "updatedAt": "2026-09-08T01:00:00Z"
  }
]
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/v1/projects \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-commerce Website",
    "description": "Build a full-stack e-commerce platform",
    "category": "Web",
    "sub_category": "Full Stack",
    "primaryLanguage": "TYPESCRIPT",
    "platforms": ["WEB", "MOBILE"],
    "clientId": "fc314f89-fbc7-4ebe-b7b3-7a08b7e47418",
    "status": "OPEN"
  }'
```

---

### Get Project by ID

Retrieve a single project by its UUID.

**Endpoint**: `GET /api/v1/projects/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project UUID |

**Response** (200):
```json
{
  "id": "project_uuid",
  "clientId": "uuid",
  "programmerId": null,
  "title": "E-commerce Website",
  "description": "Build a full-stack e-commerce platform",
  "category": "Web",
  "sub_category": "Full Stack",
  "primaryLanguage": "TYPESCRIPT",
  "platforms": ["WEB", "MOBILE"],
  "status": "OPEN",
  "completedAt": null,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
```json
{ "error": "Project not found" }
```

**Example**:
```bash
curl "http://localhost:3333/api/v1/projects/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

### Update Project

Update an existing project.

**Endpoint**: `PUT /api/v1/projects/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project UUID |

**Request Body** (partial update supported):
```json
{
  "title": "Updated Project Title",
  "status": "IN_DEVELOPMENT",
  "programmerId": "uuid_of_programmer"
}
```

**Response** (200):
```json
{
  "id": "project_uuid",
  "clientId": "uuid",
  "programmerId": "uuid_or_null",
  "title": "Updated Project Title",
  "description": "Original description",
  "category": "Web",
  "sub_category": "Full Stack",
  "primaryLanguage": "TYPESCRIPT",
  "platforms": ["WEB"],
  "status": "IN_DEVELOPMENT",
  "completedAt": null,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T02:00:00Z"
}
```

**Example**:
```bash
curl -X PUT "http://localhost:3333/api/v1/projects/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Project Title",
    "status": "IN_DEVELOPMENT"
  }'
```

---

### Delete Project

Delete a project permanently.

**Endpoint**: `DELETE /api/v1/projects/:id`

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Project UUID |

**Response** (200):
```json
{
  "id": "deleted_project_uuid",
  "clientId": "uuid",
  "programmerId": null,
  "title": "Deleted Project",
  "description": "...",
  "category": "Web",
  "sub_category": "Full Stack",
  "primaryLanguage": "TYPESCRIPT",
  "platforms": ["WEB"],
  "status": "OPEN",
  "completedAt": null,
  "createdAt": "2026-09-08T01:00:00Z",
  "updatedAt": "2026-09-08T01:00:00Z"
}
```

**Response** (404):
```json
{ "error": "Project not found" }
```

**Example**:
```bash
curl -X DELETE "http://localhost:3333/api/v1/projects/550e8400-e29b-41d4-a716-446655440000" \
  -b cookies.txt
```

---

## Enumerations

### ProgrammingLanguageEnum
- `CSHARP`
- `NODE_JS`
- `JAVA`
- `GO`
- `PYTHON`
- `TYPESCRIPT`
- `JAVASCRIPT`
- `PHP`
- `RUST`
- `KOTLIN`
- `SWIFT`
- `OTHER`

### PlatformTypeEnum
- `WEB`
- `DESKTOP`
- `MOBILE`

### ProjectStatusEnum
- `OPEN`
- `NEGOTIATING`
- `IN_DEVELOPMENT`
- `COMPLETED`
- `CANCELLED`
