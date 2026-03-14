# Database Design

This document details the schema design built on PostgreSQL using Prisma.

## Core Entities

### User & Identity
1. **User**
   - **Purpose**: System identity and authentication record.
   - **Key Fields**: `username` (unique), `password` (hashed), `isActive`, `roleId`.
   - **Relationships**:
     - 1:1 with `UserProfile`
     - 1:N with `Project` (as owner)
     - N:1 with `Role`

2. **UserProfile**
   - **Purpose**: Extended personal and professional metadata separated from core auth fields for better query performance.
   - **Key Fields**: `email`, `bio`, `location`, `socialLinks`, `skills` (JSON/Comma-separated strings).

### RBAC (Role-Based Access Control)
3. **Role**
   - **Purpose**: Defines a group of users to assign bulk permissions.
   - **Key Fields**: `name` (unique), `description`.
   - **Relationships**:
     - M:N with `Permission`
     - 1:N with `User`

4. **Permission**
   - **Purpose**: Granular, resource-specific access rights (e.g., `create:project`).
   - **Key Fields**: `name` (unique).
   - **Relationships**:
     - M:N with `Role`

### Productivity (Projects)
5. **Project**
   - **Purpose**: A high-level collection of work belonging to a user.
   - **Key Fields**: `title` (unique), `type`, `status` (ACTIVE, ON-HOLD, COMPLETED, ARCHIVED), `columns` (Array of strings for Kanban).
   - **Relationships**:
     - N:1 with `User` (owner)
     - 1:N with `Phase`
     - 1:N with `Task`

6. **Phase**
   - **Purpose**: A temporal subset of a project (e.g., a Sprint or Milestone).
   - **Key Fields**: `startDate`, `endDate`, `status`.
   - **Relationships**:
     - N:1 with `Project`
     - 1:N with `Task`

7. **Task**
   - **Purpose**: Actionable work items.
   - **Key Fields**: `title`, `description`, `status` (PENDING, IN_PROGRESS, COMPLETED).
   - **Relationships**:
     - N:1 with `Project`
     - N:1 with `Phase` (optional)

### Knowledge Base
8. **Article**
   - **Purpose**: Isolated storage for rich-text notes.
   - **Key Fields**: `title` (unique), `body`, `published`.

## Schema Principles
- **Soft Deletes vs Active Flags**: The system currently relies on boolean flags like `isActive` on Users rather than complex soft-delete implementations, keeping queries simple.
- **JSON vs Relations**: Minor fields like `skills` and `socialLinks` in UserProfile use basic string storage (likely JSON arrays or comma-delimited strings) rather than full junction tables to avoid over-engineering personal metadata.
