# API Documentation

This directory contains comprehensive documentation for the DevLink API system.

## Table of Contents

1. [Authentication](./authentication.md) - User authentication and session management
2. [Projects](./projects.md) - Project CRUD operations
3. [Notifications](./notifications.md) - Notification system
4. [Messages](./messages.md) - Project messaging system
5. [Saved Tickets](./saved-tickets.md) - Saved project bookmarks
6. [User Preferences](./user-preferences.md) - User notification settings

## System Overview

The DevLink API is built with:
- **Framework**: Elysia (Bun)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-Auth with session cookies
- **Validation**: Zod schemas

All API routes are prefixed with `/api/v1/` and require authentication via session cookie.

## Quick Start

```bash
# Sign up
curl -X POST http://localhost:3333/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"password123"}'

# Sign in
curl -X POST http://localhost:3333/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Use session cookie for authenticated requests
curl http://localhost:3333/api/v1/projects \
  -b cookies.txt
```
