# Test Files Documentation

Detailed documentation for each test file in `src/tests/`.

## File Overview

### `setup.ts`

**Purpose**: Test utilities and helper functions

**Contents**:
- `createTestApp()` - Creates an Elysia app instance for testing
- `createAuthenticatedRequest()` - Helper to simulate authenticated requests

**Usage**: Import utilities for setting up test environments

---

### `health.test.ts`

**Purpose**: Tests for the `/health` endpoint

**Tests**:
- ✅ `should return OK status` - Verifies GET /health returns `{ OK: true }`
- ✅ `should return valid JSON body` - Verifies response is valid JSON

**Coverage**: Health check endpoint functionality

---

### `projects.test.ts`

**Purpose**: Schema validation tests for projects

**Tests**:
- ✅ `ProjectCreateSchema should validate real project payload` - Valid project data with all required fields
- ✅ `ProjectCreateSchema should validate with null problem and user_actions` - Nullable field handling
- ✅ `ProjectCreateSchema should reject invalid data` - Invalid data rejection (empty title, empty platforms)
- ✅ `ProjectCreateSchema should reject missing required fields` - Missing fields validation
- ✅ `ProjectCreateSchema should reject when clientId is missing` - clientId required validation
- ✅ `ProjectCreateSchema should reject invalid clientId` - UUID validation for clientId
- ✅ `ProjectUpdateSchema should accept partial updates` - Partial update validation
- ✅ `ProjectUpdateSchema should accept empty update` - Empty partial update support
- ✅ `ProjectDTOSchema should validate full entity with all fields` - Full DTO validation
- ✅ `ProjectDTOSchema should validate entity with nullable programmerId` - Nullable programmerId handling
- ✅ `ProjectsRouter is properly configured` - Router structure verification

**Coverage**: Project DTO schemas (Create, Update, DTO), validation rules, required fields, nullable handling, default values

---

### `notification.test.ts`

**Purpose**: Schema validation tests for notifications

**Tests**:
- ✅ `NotificationCreateSchema should validate correctly with real types` - Valid notification with userId, type, title, message
- ✅ `NotificationCreateSchema should validate without projectId` - Optional projectId handling
- ✅ `NotificationCreateSchema should reject empty title` - Title min length validation
- ✅ `NotificationCreateSchema should reject invalid notification type` - Enum validation
- ✅ `NotificationCreateSchema should reject invalid userId` - UUID validation
- ✅ `NotificationUpdateSchema should accept partial updates` - Partial update (isRead)
- ✅ `NotificationUpdateSchema should accept multiple field updates` - Multiple field partial update
- ✅ `NotificationSchema should validate full entity` - Full DTO with all fields
- ✅ `NotificationSchema should validate entity with projectId` - DTO with projectId set
- ✅ `NotificationRouter is properly configured` - Router structure verification

**Coverage**: Notification DTO schemas (Create, Update, DTO), required userId, optional projectId, enum validation, default isRead=false

---

### `review.test.ts`

**Purpose**: Schema validation tests for reviews

**Tests**:
- ✅ `ReviewCreateSchema should validate correctly with real schema` - Valid review data
- ✅ `ReviewCreateSchema should reject invalid rating (> 5 or < 1)` - Rating range 1-5 validation
- ✅ `ReviewCreateSchema should reject invalid UUID` - UUID validation for projectId
- ✅ `ReviewUpdateSchema should accept partial updates` - Partial update (rating, description)
- ✅ `ReviewSchema should validate full entity` - Full DTO validation
- ✅ `ReviewRouter is properly configured` - Router structure verification

**Coverage**: Review DTO schemas (Create, Update, DTO), rating min/max (1-5), UUID validation, title max 150 chars

---

### `user_preferences.test.ts`

**Purpose**: Schema validation tests for user preferences

**Tests**:
- ✅ `UserPreferenceCreateSchema should validate correctly` - Valid preference data with custom values
- ✅ `UserPreferenceCreateSchema should apply defaults` - All defaults are true
- ✅ `UserPreferenceUpdateSchema should accept partial updates` - Partial update with defaults applied to unspecified fields
- ✅ `UserPreferenceUpdateSchema should accept empty update` - Empty partial update support
- ✅ `UserPreferenceUpdateSchema should accept full update` - All fields update
- ✅ `UserPreferenceSchema should validate full entity` - Full DTO validation
- ✅ `UserPreferenceRouter is properly configured` - Router structure verification

**Coverage**: UserPreference DTO schemas (Create, Update, DTO), default values (all true), partial update behavior with defaults

---

### `saved_ticket.test.ts`

**Purpose**: Schema validation tests for saved tickets

**Tests**:
- ✅ `SavedTicketCreateSchema should validate bookmark payload` - Valid create with projectId
- ✅ `SavedTicketCreateSchema should reject invalid project UUID` - UUID validation
- ✅ `SavedTicketCreateSchema should reject missing projectId` - Required field validation
- ✅ `SavedTicketSchema should validate full entity` - Full DTO with createdAt
- ✅ `SavedTicketSchema should validate entity with null createdAt` - Nullable createdAt handling
- ✅ `SavedTicketUpdateSchema should accept partial updates` - Partial update (projectId)
- ✅ `SavedTicketRouter is properly configured` - Router structure verification

**Coverage**: SavedTicket DTO schemas (Create, Update, DTO), required projectId, nullable createdAt, userId required in DTO

---

### `message.test.ts`

**Purpose**: Schema validation tests for messages

**Tests**:
- ✅ `MessageCreateSchema should validate message payload` - Valid message with projectId and content
- ✅ `MessageCreateSchema should validate with default isRead` - Default isRead=false
- ✅ `MessageCreateSchema should reject empty content` - Content min length validation
- ✅ `MessageCreateSchema should reject invalid project UUID` - UUID validation
- ✅ `MessageCreateSchema should reject missing required fields` - Required field validation
- ✅ `MessageUpdateSchema should accept partial updates` - Content update
- ✅ `MessageUpdateSchema should accept isRead update` - isRead toggle
- ✅ `MessageUpdateSchema should accept empty update` - Empty partial update support
- ✅ `MessageSchema should validate full entity` - Full DTO with all fields
- ✅ `MessageSchema should validate entity with isRead true` - DTO with isRead=true
- ✅ `MessageRouter is properly configured` - Router structure verification

**Coverage**: Message DTO schemas (Create, Update, DTO), required projectId/senderId/content, default isRead=false, content min length 1

---

### `auth.test.ts`

**Purpose**: Tests for auth module functionality

**Tests**:
- ✅ `should hash password using argon2id` - Password hashing with argon2id algorithm
- ✅ `should verify correct password` - Password verification success
- ✅ `should reject incorrect password` - Password verification failure
- ✅ `should have valid environment configuration loaded` - Env validation (BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, PORT)
- ✅ `BetterAuth instance should be initialized with correct plugins and routes` - Auth instance verification

**Coverage**: Password hashing (argon2id), verification, environment configuration validation, BetterAuth initialization

---

### `enums.test.ts`

**Purpose**: Tests for enum validation

**Tests**:
- ✅ `ProjectStatusEnum values` - Valid: OPEN, NEGOTIATING, IN_DEVELOPMENT, COMPLETED, CANCELLED
- ✅ `PlatformTypeEnum values` - Valid: WEB, DESKTOP, MOBILE
- ✅ `ProgrammingLanguageEnum values` - Valid: CSHARP, TYPESCRIPT, RUST (and 9 more)
- ✅ `AudienceEnum values` - Valid: CLIENTS, INTERNAL_TOOL
- ✅ `NotificationTypeEnum values` - Valid: NEW_MESSAGE, NEW_REVIEW, PROJECT_UPDATE, PROJECT_COMPLETED, PROJECT_CANCELLED, TICKET_SAVED, SYSTEM
- ✅ `UserRoleEnum values` - Valid: CLIENT, PROGRAMMER, ADMIN

**Coverage**: All enum types with valid values and invalid value rejection (throws on parse)

---

### `routes.test.ts`

**Purpose**: Integration tests for all route structures

**Tests**:
- ✅ `GET /health returns 200 OK status with { OK: true }` - Health endpoint works
- ✅ `GET /api/v1/projects requires authentication (401)` - Auth guard for GET
- ✅ `POST /api/v1/projects returns validation error without auth (422)` - Body validation before auth
- ✅ `POST /api/v1/projects without body returns validation error (422)` - Empty body validation
- ✅ `GET /api/v1/notifications requires authentication (401)` - Auth guard
- ✅ `GET /api/v1/messages requires authentication (401)` - Auth guard
- ✅ `GET /api/v1/user-preferences requires authentication (401)` - Auth guard
- ✅ `GET /api/v1/saved-tickets requires authentication (401)` - Auth guard
- ✅ `GET /api/v1/reviews requires authentication (401)` - Auth guard
- ✅ `All routers are properly mounted and respond to requests` - Route structure verification (no 404s)

**Coverage**: End-to-end route structure, authentication guards, validation order (body validation before auth returns 422 not 401)

---

## Test Coverage Summary

| Feature | File | Tests |
|---------|------|-------|
| Health Endpoint | `health.test.ts` | 2 |
| Projects | `projects.test.ts` | 11 |
| Notifications | `notification.test.ts` | 10 |
| Reviews | `review.test.ts` | 6 |
| User Preferences | `user_preferences.test.ts` | 7 |
| Saved Tickets | `saved_ticket.test.ts` | 7 |
| Messages | `message.test.ts` | 11 |
| Auth Module | `auth.test.ts` | 5 |
| Enums | `enums.test.ts` | 6 |
| Routes Integration | `routes.test.ts` | 10 |

**Total**: 75 tests across 10 files
