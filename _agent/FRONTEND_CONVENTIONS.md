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

### 🏗️ Component Organization & Architecture

#### 1. Avoid "God Components"
- **Definition**: A component that handles too many responsibilities (e.g., managing logic for two different pages like Board and Backlog).
- **Rule**: If a component contains logic for multiple distinct views, separate them into dedicated components.
- **Logic Extraction**: Use custom hooks (e.g., `useTicketManagement`) to encapsulate shared business logic, state, and actions, allowing the UI components to remain focused and clean.

#### 2. "Nearest Common Parent" Rule
- **Dependency Rule**: A route (e.g., `backlog`) should never import components directly from another route (e.g., `board`).
- **Organization**: If two or more routes share a component, move that component to their **nearest common parent** directory's `_ui` folder.
  - Example: If `board` and `backlog` both use a `TicketModal`, move it to `projects/[id]/_ui/components/` instead of keeping it in `board/_ui/components/`.
- **Project Level**: Only move components to the global `src/components` if they are generic UI primitives used across the entire application.

#### 3. Standardized UI Wrappers
- **Rule**: Avoid using raw HTML inputs or base Shadcn components directly for frequent project-specific needs.
- **Practice**: Use project-standardized wrappers like `CustomInput`, `CustomSelect`, and `MarkdownEditor` from `@/components/ui/input`.
- **Benifit**: These components provide consistent styling, built-in icon support, and dark mode compliance out of the box.

#### 4. Server Action Response Pattern
- **Standard Signature**: All server actions should return a consistent response object:
  ```typescript
  { data?: T; error?: string; statusCode: number }
  ```
- **Error Handling**: Use the provided `isSuccessApiResponse` and `isFailureApiResponse` utilities to handle these responses on the client side.
- **Redirection**: Handle critical failures (like 401 Unauthorized or 404 Not Found) directly within the Server Action using Next.js `redirect()` or `notFound()` where appropriate.

#### 5. Co-located Types and Constants
- **Types**: Store domain-specific models in a `_types/` folder co-located within the relevant feature directory (e.g., `projects/_types/project.ts`).
- **Constants**: Keep route-specific constants co-located. Reserve `src/constants` for values used globally across the entire application (e.g., `endpoints.ts`, `fetch.ts`).

---

## 🧠 Software Engineering Principles

### 💎 SOLID Principles (React Context)

#### 1. Single Responsibility Principle (SRP)
- **Component**: A component should do one thing. If it's fetching data, managing complex state, and rendering a complex UI, split it.
- **Hook**: Custom hooks should handle one piece of logic (e.g., `useAuth`, `useTickets`) rather than being a catch-all for a page.

#### 2. Open/Closed Principle (OCP)
- **Rule**: Components should be open for extension but closed for modification.
- **Practice**: Use **Composition**. Instead of adding more boolean flags to a component to handle new use cases, allow it to accept `children` or specialized "slots" as props.

#### 3. Liskov Substitution Principle (LSP)
- **Rule**: Subtypes should be substitutable for their base types.
- **Practice**: When wrapping a base component (like a Shadcn `Button`), ensure the wrapper (`CustomButton`) still accepts and correctly handles all standard `ButtonProps`.

#### 4. Interface Segregation Principle (ISP)
- **Rule**: Don't force components to depend on props they don't use.
- **Practice**: Instead of passing a whole `User` object to a component that only needs `user.avatarUrl`, just pass the string. This makes the component easier to reuse and test.

#### 5. Dependency Inversion Principle (DIP)
- **Rule**: Depend on abstractions, not concretions.
- **Practice**: Use **Custom Hooks** as an abstraction layer for data fetching. The component shouldn't know *how* tickets are fetched (Axios, Fetch, or SDK), just that `useTickets()` provides them.

### 🛠️ Other Essential Rules

- **DRY (Don't Repeat Yourself)**: If you find logic or styles repeated 3 times, extract them into a utility or shared component.
- **KISS (Keep It Simple, Stupid)**: Favor simple, readable code over clever or "over-engineered" solutions.
- **YAGNI (You Ain't Gonna Need It)**: Don't implement features or abstractions based on "future needs." Build what is necessary now.
- **Composition over Inheritance**: React is built around composition. Use it to build complex UIs from simple, focused building blocks.

---

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
