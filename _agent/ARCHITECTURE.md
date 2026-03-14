# Application Architecture

This application is designed as a **Monorepo** managed by `pnpm`, featuring strict boundaries between the frontend interface, the backend API, and a shared source of truth.

## High-Level Topology

```mermaid
graph TD
    A[Frontend (Next.js)] -->|HTTP / REST| B[Backend (NestJS)]
    A -.->|Imports| C[Shared Package]
    B -.->|Imports| C
    B -->|Prisma Client| D[(PostgreSQL)]
    E[Frontend Design (Vite)] -.->|Prototyping| A
```

## Workspaces (Packages)

### 1. Backend (`backend/`)
Built with **NestJS (v11)**, enforcing a strict Layered Architecture to decouple network logic from business rules and data access.

*   **Controllers Layer**: Handles HTTP routing, extracts path variables/body data, and applies Zod validation pipes. Should contain **no business logic**.
*   **Services Layer**: The brain of the application. Orchestrates operations, enforces business rules, and integrates multiple repositories.
*   **Repository Layer (Data Access Pattern)**: Classes ending in `.repository.ts` abstract Prisma operations. This is critical for testability and prevents Prisma queries from bleeding into the Service layer.

**Security**: Applied at the Controller level using custom decorators like `@CurrentUserId()` and `@Permissions()` mapped to the RBAC database modules.

### 2. Frontend (`frontend/`)
Built with **Next.js 16 (React 19)** using the App Router geometry.

*   **Server Components (RSC)**: Used by default for fetching layout data, verifying tokens on the server, and sending HTML directly to the client without heavy JS bundles.
*   **Client Components**: Isolated to interactive UI pieces (e.g., forms, Kanban drag-and-drop).
*   **Suspense Architecture**: The application relies heavily on `Suspense` wraps for non-blocking rendering. Data fetching happens in `_ui/wrapper` components while layout shells render instantly.
*   **State Management**: React Query (`@tanstack/react-query`) is used to cache server data on the client side to avoid redundant REST calls.

### 3. Shared Library (`shared/`)
The **Source of Truth** package.

*   **Zod Schemas**: Defines the exact shape of payloads expected by the API.
*   **TypeScript Types**: Inferred directly from Zod to guarantee the Frontend and Backend see the same types.
*   **Domain Constants**: Standardizes enums like `ProjectStatus` and `TaskType` to prevent string mapping errors across the network divide.

### 4. Frontend Design (`frontend_design/`)
A dedicated UI sandbox built on **Vite**.
*   **Purpose**: Rapid prototyping of complex React components (using Tailwind CSS and Radix UI) without the overhead or routing complexity of the main Next.js application. Components built here are manually transplanted into `frontend/` once verified.
