# Pharmacy Point - Technology Stack

## Architecture Overview
A full-stack JavaScript/TypeScript application following the **Next.js App Router** architecture with a separate Express.js API server, PostgreSQL database, and modern frontend tooling.

## Frontend Stack

### Framework
- **Next.js 14+** (App Router) - React framework with server components, routing, and API routes
- **React 18+** - Component-based UI library

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - Reusable component library built on Radix UI and Tailwind
- **Class Variance Authority (cva)** - Conditional CSS class composition

### Forms & Validation
- **React Hook Form** - Performant forms with minimal re-renders
- **Zod** - Schema validation with TypeScript type inference
- **ZodResolver** - Integration between RHF and Zod

### State Management
- **React Context API** - For global state (auth, cart, inventory)
- **React Query / TanStack Query** - Server state management and caching

## Backend Stack

### API Layer
- **Express.js 4.x** - RESTful API server
- **TypeScript** - Type-safe JavaScript
- **Express Validator** - Request validation middleware

### Database
- **PostgreSQL 15+** - Relational database for ACID compliance
- **Prisma ORM** - Type-safe database client and migrations
- **Redis** (planned) - Session storage and caching

### Authentication & Authorization
- **NextAuth.js** - Authentication solution for Next.js
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

## Infrastructure

### Development
- **Node.js 18+** - Runtime environment
- **npm / pnpm** - Package manager
- **nodemon** - Development auto-restart
- **ESLint + Prettier** - Code linting and formatting

### Deployment
- **Vercel** - Frontend hosting (Next.js optimized)
- **Railway / Render / DigitalOcean** - Backend hosting
- **Neon / Supabase** - Managed PostgreSQL
- **Docker** - Containerization for local dev and deployment

### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Supertest** - API integration testing
- **Playwright** - End-to-end testing

## Development Tools

### IDEs & Editors
- **VS Code** - Primary development environment
- **ESLint** - Static code analysis
- **Prettier** - Code formatting

### Version Control
- **Git** - Version control
- **GitHub** - Repository hosting

### APIs & Integrations
- **Stripe** - Payment processing (POS system)
- **NHS/Digital Health API** (if applicable) - Drug information
- **Email Service (SendGrid/Nodemailer)** - Notifications

## Project Structure
```
pharmacy-point/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Express.js backend
├── packages/
│   ├── ui/               # Shared shadcn components
│   └── types/            # Shared TypeScript types
├── prisma/               # Database schema & migrations
└── docker/               # Docker configurations
```

## Why This Stack?

| Criteria | Choice | Rationale |
|----------|--------|-----------|
| Fullstack JS | Next.js + Express | Single language throughout, rich ecosystem |
| Database | PostgreSQL | ACID compliance, reliability, JSONB support |
| Performance | Server Components | Reduced client bundle size |
| Developer Experience | TypeScript | Type safety, better refactoring, IDE support |
| Scalability | Prisma ORM | Type-safe queries, migrations, connection pooling |
| UI/UX | shadcn/ui + Tailwind | Rapid development, customizable, accessible components |
