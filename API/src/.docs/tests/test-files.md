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
- ✅ `ProjectCreateSchema should validate correctly` - Valid project data validation
- ✅ `ProjectCreateSchema should reject invalid data` - Empty/invalid project data rejection
- ✅ `ProjectUpdateSchema should accept partial updates` - Partial update validation
- ✅ `should have correct route structure` - Router structure verification

**Coverage**: Project DTO schemas and validation rules

---

### `notification.test.ts`

**Purpose**: Schema validation tests for notifications

**Tests**:
- ✅ `NotificationCreateSchema should validate correctly` - Valid notification data
- ✅ `NotificationCreateSchema should reject empty title` - Validation error cases
- ✅ `NotificationUpdateSchema should accept partial updates` - Partial update support
- ✅ `should have correct route structure` - Router structure verification

**Coverage**: Notification DTO schemas and validation rules

---

### `review.test.ts`

**Purpose**: Schema validation tests for reviews

**Tests**:
- ✅ `ReviewCreateSchema should validate correctly` - Valid review data
- ✅ `ReviewCreateSchema should reject invalid rating` - Rating must be 1-5
- ✅ `ReviewCreateSchema should reject invalid UUID` - Project ID validation
- ✅ `ReviewUpdateSchema should accept partial updates` - Partial update support
- ✅ `should have correct route structure` - Router structure verification

**Coverage**: Review DTO schemas, rating validation, UUID validation

---

### `user_preferences.test.ts`

**Purpose**: Schema validation tests for user preferences

**Tests**:
- ✅ `UserPreferenceCreateSchema should validate correctly` - Valid preference data
- ✅ `UserPreferenceCreateSchema should use defaults` - Default values for theme, notifications, language
- ✅ `UserPreferenceUpdateSchema should accept partial updates` - Partial update support
- ✅ `should have correct route structure` - Router structure verification

**Coverage**: User preference DTO schemas, default value handling

---

### `saved_ticket.test.ts`

**Purpose**: Schema validation tests for saved tickets

**Tests**:
- ✅ `SavedTicketCreateSchema should validate correctly` - Valid ticket data
- ✅ `SavedTicketCreateSchema should enforce title length limits` - Title max 200 chars
- ✅ `SavedTicketCreateSchema should use default status` - Default status "open"
- ✅ `should have correct route structure` - Router structure verification

**Coverage**: Saved ticket DTO schemas, length limits, default values

---

### `auth.test.ts`

**Purpose**: Tests for auth module functionality

**Tests**:
- ✅ `should hash password using argon2id` - Password hashing functionality
- ✅ `should verify correct password` - Password verification success
- ✅ `should reject incorrect password` - Password verification failure
- ✅ `should validate BETTER_AUTH_SECRET length` - Secret must be 32+ chars
- ✅ `should validate BETTER_AUTH_URL format` - URL must start with http://localhost:

**Coverage**: Password hashing, verification, environment validation

---

### `enums.test.ts`

**Purpose**: Tests for enum validation

**Tests**:
- ✅ `ProjectStatus enum values` - Valid status values: active, completed, on_hold, cancelled
- ✅ `ProjectStatus enum should reject invalid values` - Invalid status rejection
- ✅ `NotificationType enum values` - Valid types: info, success, warning, error
- ✅ `TicketStatus enum values` - Valid statuses: open, in_progress, resolved, closed

**Coverage**: Enum validation and allowed values

---

### `routes.test.ts`

**Purpose**: Integration tests for all route structures

**Tests**:
- ✅ `GET /health returns OK status` - Health endpoint works
- ✅ `Projects Routes - Validation` - POST/GET projects validation behavior
- ✅ `Notification Routes - Validation` - POST/GET notification validation
- ✅ `UserPreference Routes - Validation` - POST/GET user preferences validation
- ✅ `SavedTicket Routes - Validation` - POST/GET saved ticket validation
- ✅ `Review Routes - Validation` - POST/GET review validation
- ✅ `Route Structure Verification` - All routers properly mounted

**Coverage**: End-to-end route structure and validation integration

---

## Test Coverage Summary

| Feature | File | Tests |
|---------|------|-------|
| Health Endpoint | `health.test.ts` | 2 |
| Projects | `projects.test.ts` | 4 |
| Notifications | `notification.test.ts` | 4 |
| Reviews | `review.test.ts` | 5 |
| User Preferences | `user_preferences.test.ts` | 4 |
| Saved Tickets | `saved_ticket.test.ts` | 4 |
| Auth Module | `auth.test.ts` | 5 |
| Enums | `enums.test.ts` | 4 |
| Routes Integration | `routes.test.ts` | 12 |

**Total**: 44 tests across 9 files
