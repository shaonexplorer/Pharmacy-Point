# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pharmacy Point** is a full-stack pharmacy management application being built using a spec-driven development approach. The project is currently in the planning phase with comprehensive documentation in place.

## Project Structure

```markdown
pharmacy-point/
├── specs/                    # Specification documents (read first)
│   ├── mission.md             # Vision, goals, and success metrics
│   ├── techstack.md           # Technology stack and architecture decisions
│   └── roadmap.md             # Development phases and milestones
├── backend/                   # Express.js API server (to be created)
├── frontend/                  # Next.js application (to be created)
└── project-brief.md           # Initial requirements
```

## Architecture Plans

This project will follow a **monorepo architecture** with:

- **Frontend**: Next.js 14+ (App Router), React 18+, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript, PostgreSQL via Prisma ORM
- **Database**: PostgreSQL 15+ with Prisma migrations
- **Authentication**: NextAuth.js with JWT

Key features planned:

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

When development begins:

1. **Setup**: Run `npm install` in both `frontend/` and `backend/` directories
2. **Database**: Run `npx prisma migrate dev` to set up PostgreSQL schema
3. **Frontend**: Run `npm run dev` in the frontend directory
4. **Backend**: Run `npm run dev` in the backend directory
5. **Testing**: Run `npm test` in each relevant directory

## Key Files to Reference

- `specs/mission.md` - Read for project vision and objectives
- `specs/techstack.md` - Read for technology choices and rationale
- `specs/roadmap.md` - Read for development phases and feature priorities

## Development Commands (to be defined when code exists)

These will be populated once the frontend and backend directories have package.json files:

**Frontend (Next.js)**:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

**Backend (Express.js)**:

- `npm run dev` - Start development server with nodemon
- `npm run build` - TypeScript compilation
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

