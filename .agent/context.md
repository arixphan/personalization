# Personalization Project Context

## Overview
This is a monorepo workspace managed by `pnpm`, containing multiple applications that assist with daily tasks: time management, project management, and finance management.

## Project Structure
The repository is divided into three main packages within the workspace:

- `frontend/`: A web client application built with React and Next.js.
- `backend/`: A server-side API application built with NestJS.
- `shared/`: A shared library containing common types, DTOs, Zod schemas, and constants used by both frontend and backend.

## Tech Stack & Conventions

### Frontend
- **Framework:** Next.js (v16) with React 19.
- **Styling:** Tailwind CSS (v4) under a utility-first approach. Uses `clsx` and `tailwind-merge` for class merging.
- **Components:** Radix UI primitives.
- **Animations:** framer-motion (`motion`) and `tw-animate-css`.
- **State & Data Fetching:** React Query (`@tanstack/react-query`).
- **Icons:** `lucide-react` and `react-icons`.
- **Development Port:** Runs on `localhost:3001` (`pnpm run frontend:dev`).

### Backend
- **Framework:** NestJS (v11) layered architecture (Controllers -> Services).
- **Database ORM:** Prisma interacting with PostgreSQL.
- **Authentication:** Passport with JWT (`@nestjs/jwt`, `passport-jwt`) and local username/password strategies. Uses `bcrypt` for hashing.
- **Validation:** Uses `@personalization/shared` Zod schemas integrated via a custom `ZodValidationPipe`. Also uses `class-validator` and `class-transformer` for DTOs.
- **Security:** Decorators for `@CurrentUserId()` and `@Permissions()` for RBAC (Role-Based Access Control).

### Shared Package
- **Location:** `shared/`
- **Purpose:** Central repository for everything that is shared between the frontend and backend. This includes types, utilities, helper functions, DTOs, Zod schemas, and constants (e.g., `TaskType`, `ProjectStatus`).
- **Workflow:** Any time schemas or constants are changed here, you **must run** `pnpm -C shared build` to compile the TypeScript definitions for the backend and frontend to pick them up.

## Key Developer Commands
- **Root Dev:** `pnpm run dev` (starts backend, frontend, and shared in watch mode)
- **Shared Build:** `pnpm -C shared build`
- **Docker:** Requires a PostgreSQL database container for Prisma (`docker-compose up postgres`).

## Development Rules for AI Agents
1. **Always use absolute paths** or workspace paths (`@personalization/shared`) for imports, unless within the same module where relative paths are permitted.
2. **When modifying APIs:** 
   - Define the data shape using Zod in `shared/src/dtos`.
   - Export both the Zod Schema and its inferred TypeScript DTO type in `shared/src/index.ts`.
   - Update backend controller validation using the exported Zod Schema.
3. **Run builds:** Keep in mind that `shared/` must be built (`tsc`) whenever changes are made so the backend/frontend watcher can see the updated generated `dist` files.
4. **React & Next.js Guidelines:** Always adhere to the official Vercel React Best Practices, which have been downloaded to `.agent/react-best-practices.md`. Read this file to understand performance rules related to rendering, bundle size, and server/client boundaries before proposing architectural changes or new UI components.
5. **NestJS Guidelines:** Always adhere to the NestJS Best Practices from `Kadajett/agent-nestjs-skills`, downloaded to `.agent/nestjs-best-practices.md`. Review this file before creating or modifying modules, services, or controllers to ensure standard architecture, proper dependency injection, and clean boundaries.
