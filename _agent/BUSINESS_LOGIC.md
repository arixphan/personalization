# Business Logic & Modules

This document describes each module in the Personalization application and its core functionality. It serves as a guide for understanding the domain logic and how features interact.

## 1. Authentication Module (`auth`)
**Purpose**: Handles user identity verification, token issuance, and secure access management.
- **Functionality**:
  - Validates user credentials against the database (`User` model).
  - Issues short-lived Access Tokens (JWT) for API requests and long-lived Refresh Tokens (HttpOnly cookies) for session persistence.
  - Manages password hashing (using `bcrypt`) and verification.

## 2. User & RBAC Module (`user`, `permission`)
**Purpose**: Manages user profiles and enforces Role-Based Access Control (RBAC).
- **Functionality**:
  - **User Management**: CRUD operations for `User` and `UserProfile` entities. Handles fetching profile data (bio, skills, location).
  - **Role & Permissions**: Assigns roles (e.g., Admin, Regular User) to users. Validates whether a user's role has the designated permissions to perform specific actions across the application.
  - Exposes `@CurrentUserId()` and `@Permissions()` decorators for controller-level security.

## 3. Project Management Module (`projects`)
**Purpose**: Core productivity feature for planning and tracking work.
- **Functionality**:
  - **Projects**: High-level containers that belong to a single owner. Defines the status (Active, On-Hold, Completed, Archived) and type of project. Each project automatically gets exactly one Active Phase (status `IN_PROGRESS`) upon creation.
  - **Phases**: Time-boxed segments within a project. The active phase represents the current iteration.
  - **Tickets**: Granular items linked to a Project and, optionally, a Phase, representing the actual work to be done. 
    - When created, a Ticket defaults its status to the first column defined in `Project.columns`.
  - **Kanban Flow (Board View)**: Displays all tickets assigned to the Active Phase. Columns map to `Project.columns`. Dragging and dropping tickets updates their status.
  - **Backlog View**: Displays tickets that are NOT finished and NOT assigned to the Active Phase (`phaseId` is null). Users can move tickets from the Backlog to the Active Phase for execution.

## 4. Content & Knowledge Module (Implicit / Planned)
**Purpose**: A personal knowledge base and note-taking system.
- **Functionality**:
  - **Articles**: Stores markdown or rich text content (Title, Body, Published status) for personal documentation or blogging.

## 5. Shared Module (`shared` workspace package)
**Purpose**: Central nervous system for cross-boundary data consistency.
- **Functionality**:
  - Ensures the Frontend and Backend use identical types (`TicketType`, `ProjectStatus`).
  - Holds Zod schemas for request validation to ensure the API receives exactly what the frontend sends, and vice-versa.
  - Maintains permission name constants to prevent string-typo vulnerabilities in RBAC.


