# Frontend Development Conventions

This document defines the architectural and coding standards for the frontend application.

## 1. Directory Structure

The project follows a modular structure within the Next.js App Router (`src/app`).

### Route Organization
- `(auth)`: Public routes related to authentication.
- `(protection)`: Routes requiring an active session.

### Modular Pattern
Each major route module (e.g., `projects`) should organize internal resources into underscored directories to keep the main route folder clean:
- `_ui/`: Route-specific React components.
- `_actions/`: Server side logic/actions for this route.
- `_lib/`: Helper functions specific to this route.
- `_types/`: TypeScript definitions specific to this route.

## 2. Naming Conventions

### File Naming
- **React Components**: `kebab-case.tsx` (e.g., `project-list.tsx`).
- **Standard TypeScript**: `kebab-case.ts` (e.g., `validation-utils.ts`).
- **Folders**: `kebab-case`.

### Code Naming
- **Components**: `PascalCase` (e.g., `const ProjectCard = ...`).
- **Functions/Variables**: `camelCase` (e.g., `const fetchData = ...`).
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `const API_BASE_URL = ...`).
- **Types/Interfaces**: `PascalCase` (e.g., `interface UserProfile { ... }`).

## 3. Technology Stack & Patterns

- **Framework**: Next.js (App Router).
- **Language**: TypeScript (Strict).
- **Styling**: Tailwind CSS.
- **Components**: Functional components + Hooks.
- **API Interaction**: 
  - Centralized in `src/lib/base-api.ts`.
  - Uses `EndpointFactory` for standardizing paths.
  - Server Actions for data mutation.

## 4. UI Library

- Built on top of **Radix UI**.
- Located in `src/components/ui`.
- Follows shadcn/ui patterns where applicable.
