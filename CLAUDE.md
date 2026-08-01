# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on code in this repository.

## Project Overview

**Pharmacy Point** is a full-stack pharmacy management application being built using a spec-driven development approach. The project is currently in **Phase 1 (Project Setup)** with comprehensive documentation in place and the monorepo infrastructure complete.

## Project Structure

```markdown
pharmacy-point/
├── specs/ # Specification documents (read first)
│ ├── mission.md # Vision, goals, and success metrics
│ ├── techstack.md # Technology stack and architecture decisions
│ ├── roadmap.md # Development phases and milestones
│ └── phase-1-project-setup/
│ └── plan.md # Phase 1 implementation plan (COMPLETED)
├── backend/ # Express.js API server
│ ├── src/ # Source code
│ │ └── index.ts # Main server entry point
│ ├── prisma/ # Prisma schema and migrations
│ ├── prisma.config.ts # Prisma configuration
│ ├── .env # Environment variables
│ ├── package.json # Backend dependencies
│ └── tsconfig.json # TypeScript configuration
├── frontend/ # Next.js application
│ ├── src/
│ │ └── app/ # App Router structure
│ │ ├── layout.tsx # Root layout
│ │ └── page.tsx # Home page
│ ├── components.json # shadcn/ui configuration
│ ├── package.json # Frontend dependencies
│ ├── tsconfig.json # TypeScript configuration
│ └── eslint.config.mjs # ESLint configuration
├── packages/ # Shared packages
│ ├── types/ # Shared TypeScript types
│ └── config/ # Shared configuration
├── package.json # Root package.json with workspaces
├── turbo.json # Turborepo configuration
└── tsconfig.json # Root TypeScript configuration
```

## Architecture

This project follows a **monorepo architecture** using Turborepo with npm workspaces:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js 5.x with TypeScript, PostgreSQL via Prisma ORM
- **Database**: PostgreSQL 15+ with Prisma migrations
- **Authentication**: NextAuth.js with JWT (planned for Phase 2)

## Key Features (Planned)

- Inventory management with low stock alerts
- POS system with Stripe integration
- Customer management and due accounts
- Analytics dashboard with charts/reports
- Email notifications for alerts

## Documentation

For up-to-date documentation on any library, framework, or API used in this project, use **Context7**:

```bash
npx ctx7@latest library "Next.js" "How do I use server components in Next.js 14?"
npx ctx7@latest library "Prisma" "How do I set up PostgreSQL connection?"
npx ctx7@latest library "React Hook Form" "How do I integrate with Zod?"
```

For UI/UX design decisions, use the **`/frontend-design`** skill to get guidance on:

- Visual design direction and aesthetics
- Typography and color scheme choices
- Component design best practices
- Accessibility considerations

For shadcn/ui component management, use the **`/shadcn`** skill to:

- Add new components from the registry
- Customize existing components
- Fix component bugs or styling issues
- Manage component variants and presets

## Development Workflow

### Initial Setup

1. **Install dependencies** from the root directory:

   ```bash
   npm install
   ```

2. **Set up PostgreSQL database** and configure `.env` in `backend/.env`:

   ```bash
   cd backend
   npx prisma migrate dev
   ```

3. **Start development servers**:
   ```bash
   # From root - runs both frontend and backend
   npm run dev

   # Or run individually:
   npm run dev --workspace=frontend  # http://localhost:3000
   npm run dev --workspace=backend   # http://localhost:5000
   ```

### Available Scripts (Root)

- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build both applications
- `npm run lint` - Run ESLint on both projects
- `npm run typecheck` - Run TypeScript type checking

### Available Scripts (Frontend)

- `npm run dev` - Start Next.js dev server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Available Scripts (Backend)

- `npm run dev` - Start Express.js dev server with nodemon (http://localhost:5000)
- `npm run build` - TypeScript compilation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run prisma` - Run Prisma CLI commands

## Key Files to Reference

- `specs/mission.md` - Project vision and objectives
- `specs/techstack.md` - Technology choices and rationale
- `specs/roadmap.md` - Development phases and feature priorities
- `specs/phase-1-project-setup/plan.md` - Phase 1 implementation plan (COMPLETED)

## Path Aliases

The following path aliases are configured for monorepo imports:

- `@/*` - Frontend source files (`frontend/src/*`)
- `@backend/*` - Backend source files (`backend/src/*`)
- `@pharmacy-point/types` - Shared TypeScript types
- `@pharmacy-point/config` - Shared configuration

## Development Commands

**Frontend (Next.js)**:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

**Backend (Express.js)**:

- `npm run dev` - Start development server with nodemon
- `npm run build` - TypeScript compilation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run prisma` - Run Prisma CLI commands

## Current Status

**Phase 1: Project Setup - COMPLETED ✅**

- Monorepo architecture established with Turborepo
- Frontend: Next.js 16, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- Backend: Express.js 5.x, TypeScript, Prisma ORM
- Shared configuration and types packages created
- All TypeScript compilation passes
- All ESLint/Prettier checks pass
