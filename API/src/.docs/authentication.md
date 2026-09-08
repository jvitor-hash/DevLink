# Authentication

## Overview

The DevLink API uses **Better-Auth** for authentication with session-based cookies. All API routes (except auth endpoints) require a valid session.

## Endpoints

### Register

Create a new user account.

**Endpoint**: `POST /api/auth/sign-up/email`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "token": "session_token_here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "role": "user",
    "banned": false,
    "createdAt": "2026-09-08T01:01:49.607Z",
    "updatedAt": "2026-09-08T01:01:49.607Z"
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"securepassword123"}'
```

---

### Sign In

Authenticate and receive session cookies.

**Endpoint**: `POST /api/auth/sign-in/email`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "redirect": false,
  "token": "session_token_here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "role": "user",
    "banned": false
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3333/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"securepassword123"}' \
  -c cookies.txt  # Save session cookie
```

---

### Session Management

The API uses HTTP-only cookies for session management:
- `better-auth.session_token` - Session identifier (7 days expiry)
- `better-auth.session_data` - Encrypted session data (5 minutes expiry)

**Usage**:
```bash
# Use cookie file from sign-in
curl http://localhost:3333/api/v1/projects \
  -b cookies.txt

# Or pass cookie directly
curl http://localhost:3333/api/v1/projects \
  -b "better-auth.session_token=YOUR_SESSION_TOKEN"
```

---

### User Roles

| Role         | Description                                 |
|--------------|---------------------------------------------|
| `user`       | Default role, can create projects as client |
| `programmer` | Can be assigned to projects                 |
| `admin`      | Administrative access (future use)          |

---

### Error Responses

| Code                                    | Message             | Description                 |
|-----------------------------------------|---------------------|-----------------------------|
| `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | User already exists | Email is already registered |
| Invalid credentials                     | Sign-in failed      | Wrong email or password     |
| 401                                     | Unauthorized        | Missing or invalid session  |
