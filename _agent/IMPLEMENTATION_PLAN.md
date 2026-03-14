# Implementation Plan: Project Board & Backlog

## Goal Description
Implement a Kanban Board and Backlog view for managing project tickets. The backend schema will be updated to rename tasks to tickets and support auto-generating a single active phase per project. The frontend will include a new board view, a backlog view, and a Jira-styled modal for ticket creation and updates.

## Proposed Changes

### Backend Updates

#### [MODIFY] schema.prisma
- Rename the `Ticket` model to `Ticket`.
- Make `Phase.startDate` and `Phase.endDate` optional (`DateTime?`).
- Run prisma generation and migrations.

#### [MODIFY] projects module
- Update project creation logic to automatically generate exactly one `Phase` per project.
- The default phase will have `status = "IN_PROGRESS"` and `startDate`/`endDate` as `null`.

#### [MODIFY/NEW] tickets module
- Rename all `Ticket`-related services, controllers, and DTOs to `Ticket`.
- Ensure new Ticket creation defaults the `status` to the first item in the associated `Project.columns` array.
- Create API endpoints for updating a ticket's status (used for drag and drop) and phase assignment (moving from backlog to board).

### Shared Package Updates

#### [MODIFY] shared types
- Update typed definitions in the `shared` workspace from `TicketType` to `TicketType`.
- Update corresponding Zod validation schemas.

### Frontend Updates

#### [NEW] /projects/[projectId]/board/page.tsx
- Setup routing for the new Board View.
- Fetch project details and tickets for the active phase (`status === "IN_PROGRESS"`).
- Render columns based on `Project.columns`.
- Add drag-and-drop support to transition tickets between columns.
- Include a "Backlog" toggle button.

#### [NEW] /projects/[projectId]/backlog/page.tsx (or integrated view)
- Display tickets that are not completed and have `phaseId === null`.
- Add functionality to move tickets from the backlog to the active phase.

#### [NEW] Ticket Modal Component
- Create a simplified, Jira-style modal for creating or editing a ticket.
- Allow triggering this modal via a "New Ticket" button or by clicking on an existing ticket card.

## Verification Plan

### Automated Tests
- Run backend unit/e2e tests after refactoring `Ticket` to `Ticket`.
- Execute `pnpm run backend:dev` and `pnpm run frontend:dev` to ensure successful compilation.

### Manual Verification
1. Create a new Project via the UI and verify an active Phase is auto-created in the database.
2. Create a new Ticket via the UI modal and verify its status defaults to the first column of the project.
3. Open the Board View and verify only tickets in the active phase are visible.
4. Drag and drop a ticket to another column and verify its status updates.
5. Toggle to the Backlog view and verify it displays unassigned, incomplete tickets.
6. Move a ticket from the Backlog to the Board and verify it appears on the Kanban flow.
