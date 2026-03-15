# Frontend Conventions

This document outlines the coding standards, file structures, and naming conventions for the frontend of the Personalization project.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (via Shadcn UI patterns)
- **State Management**: React Hooks (useState, useMemo, useCallback), TanStack Query
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React, React Icons

## Directory Structure & Organization

### `src/app`
- Follows Next.js App Router conventions.
- **Route Groups**: Use parentheses for logical grouping (e.g., `(auth)`, `(protection)`).
- **Dynamic Routes**: Use square brackets (e.g., `[id]`).
- **Co-location**:
  - `_ui/`: Local components specific to a route or group of routes.
  - `_actions/`: Server actions related to the route group.
  - `components/`: Smaller, reusable fragments within a specific route's `_ui`.

### `src/components`
- **`ui/`**: Low-level, reusable UI primitives (buttons, inputs, select, etc.). Often based on Radix UI.

### `src/shared`
- **`ui/`**: Shared complex components used across multiple feature areas.
- **`hooks/`**: Shared custom React hooks.
- **`context/`**: Shared React contexts.

### `src/lib`
- Specialized utility functions, API clients, and shared logic.

---

## Naming Conventions

### Files & Folders
- **Folders**: kebab-case (e.g., `board-view`, `base-api`).
- **All Files**: kebab-case (e.g., `kanban-board.tsx`, `ticket-modal.tsx`, `utils.ts`). This includes React components.

### Code
- **Components**: PascalCase (e.g., `export const KanbanView = ...`).
- **Functions**: camelCase (e.g., `export function isErrorResponse(...)`).
- **Variables/Hooks**: camelCase (e.g., `const [tickets, setTickets] = ...`).
- **Interfaces/Types**: PascalCase (e.g., `interface KanbanViewProps`).
- **Enums**: PascalCase for the enum name, SCREAMING_SNAKE_CASE for members.

---

## Component Conventions
- **Functional Components**: Favor arrow functions for component definitions.
- **Exports**: Use named exports for components and utilities.
- **Props**: Use interfaces for prop types, named `[ComponentName]Props`.
- **Hooks Order**:
  1. Hooks (useState, useMemo, etc.)
  2. Effects (useEffect)
  3. Custom handlers/callbacks (useCallback)
- **Return Pattern**: Keep the JSX clean; move complex logic into hooks or helper functions.

## Styling Patterns
- Use **Tailwind CSS** for all styling.
- Use the `cn()` utility (defined in `src/lib/utils.ts`) for conditional class merging.
- **Dark Mode**: Use `dark:` prefix for dark mode specific styles.
- **Responsive**: Mobile-first approach using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).

## API & Data Fetching
- **Server Actions**: Used for mutations and data fetching in Server Components.
- **TanStack Query**: Used for client-side state synchronization and caching if needed (currently identified in `package.json`).
- **Error Handling**: Use the `isErrorResponse` utility to check API responses.
