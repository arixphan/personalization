# Personalization Project Context & AI Instructions

This file serves as the **Root AI Instruction Map** for the Personalization monorepo. It outlines the tools, commands, and rules required for development.

For detailed domain knowledge, refer to the following architectural documents:
- 📖 [Business Logic & Modules](file:///Users/phandongho/dev/personal/personalization/_agent/BUSINESS_LOGIC.md): Feature definitions and module responsibilities.
- 🏛️ [Application Architecture](file:///Users/phandongho/dev/personal/personalization/_agent/ARCHITECTURE.md): Structural details of the Next.js, NestJS, and Shared layers.
- 🗄️ [Database Design](file:///Users/phandongho/dev/personal/personalization/_agent/DATABASE_DESIGN.md): Prisma/PostgreSQL schema definitions and relationship mapping.

---

## 1. Project Structure Overview
This is a monorepo workspace managed by `pnpm`, containing multiple applications that assist with daily tasks: time management, project management, and finance management.

- `frontend/`: Web client application built with **React 19** and **Next.js 16**. Uses Tailwind v4.
- `backend/`: Server-side API application built with **NestJS 11**. Uses Prisma and Postgres.
- `shared/`: Shared library containing common types, DTOs, Zod schemas, and constants.
- `frontend_design/`: Dedicated UI workspace for component prototyping built with **Vite**.

## 2. Key Developer Commands
Always use the exact CLI flags documented below.
- **Root Dev:** `pnpm run dev` (starts backend, frontend, and shared in watch mode)
- **Shared Build:** `pnpm -C shared build` (Crucial for TypeScript compilation)
- **Database Spin-up:** `docker-compose up postgres`

## 3. Strict Rules for AI Agents
When generating code or refactoring this project, you **MUST** adhere to the following rules:

### A. Shared Package Authority
1. Logic that exists in both environments (Validation, Types, Constants) **must** reside in `shared/`.
2. **Never skip `shared` building**: Any change made to `shared/src` is invisible to the frontend/backend until compiled. You must run `pnpm -C shared build`.
3. Provide the Zod schema and export the matching `Type` alias inside `shared/src/index.ts`.

### B. Security & Typing Strictness
1. **API Validation**: Backend controllers must use Zod schemas from `shared` via `ZodValidationPipe`. Do not reinvent validation inside the NestJS service.
2. **Implicit Any**: Always type event handlers explicitly (e.g., `React.ChangeEvent<HTMLInputElement>`).
3. **Standard Headers**: Use the native `Headers` API in custom fetch wrappers instead of object literals to bypass Index Signature linting errors.

### C. Official Skills Adherence
Before implementing major architectural changes or solving complex UI/Server interactions, you MUST read the framework-specific Best Practice Skills provided below:
1. **React/Next.js**: Read `_agent/skills/react-best-practices/SKILL.md` (Focuses on Bundle Size, Server/Client boundaries, and Suspense).
2. **NestJS**: Read `_agent/skills/nestjs-best-practices/SKILL.md` (Focuses on Dependency Injection, Circular Dependencies, and Modules).
