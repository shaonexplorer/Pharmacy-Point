# Phase 1: Authentication System - Plan

## Overview
Implement authentication using betterAuth with JWT tokens for secure user sessions in a Next.js 16 (App Router) + Express.js monorepo.

## Implementation Steps

### 1. Install Dependencies
- Backend: `@better-auth/prisma-adapter` for Prisma integration
- Frontend: `better-auth` for client-side usage

### 2. Create BetterAuth Configuration
- Create `backend/src/config/auth.ts` with Prisma adapter
- Configure email/password authentication
- Set up JWT tokens and sessions
- Configure secure cookie settings

### 3. Create API Route Handler
- Create `frontend/src/app/api/auth/[...all]/route.ts`
- Use `toNextJsHandler` to handle auth routes

### 4. Configure Environment Variables
- Add `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` to `.env` files
- Update frontend `.env.local`

### 5. Set Up Authentication Context
- Create `frontend/src/lib/auth.ts` client factory
- Implement session checking hooks

### 6. Create Middleware for Route Protection
- Create `frontend/src/middleware.ts`
- Protect authenticated routes

### 7. Database Schema Updates
- Run Prisma migration for betterAuth tables

## Timeline
- Week 2: Authentication setup, login/logout flows, session management

## Success Criteria
- Users can log in with email/password
- Sessions persist across page refreshes
- Protected routes redirect unauthenticated users
- JWT tokens are properly signed and validated

## Key Files to Create/Modify
- `backend/src/config/auth.ts` - BetterAuth server configuration
- `frontend/src/app/api/auth/[...all]/route.ts` - API route handler
- `frontend/src/lib/auth.ts` - Client-side auth utility
- `frontend/src/middleware.ts` - Route protection middleware
- `backend/prisma/schema.prisma` - May need to extend with betterAuth tables