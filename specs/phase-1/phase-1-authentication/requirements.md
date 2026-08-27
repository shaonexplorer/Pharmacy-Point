# Phase 1: Authentication System - Requirements

## Functional Requirements

### FR-1: User Login
- As a user, I need to log in with my email and password so that I can access the system.

### FR-2: User Logout
- As a user, I need to log out so that my session is terminated.

### FR-3: Session Persistence
- As a user, I need my session to persist so that I don't have to log in every time.

### FR-4: Protected Routes
- As a user, I need protected routes to redirect unauthenticated users to the login page.

## Non-Functional Requirements

### NFR-1: Security
- Passwords must be hashed using bcrypt with salt rounds of 12+
- JWT tokens must be signed with HS256 algorithm
- Session cookies must have HttpOnly, Secure, and SameSite flags

### NFR-2: Performance
- Login should complete in under 2 seconds
- Session validation should be instant

### NFR-3: Reliability
- Session should survive server restarts
- Failed login attempts should be logged

## Technical Requirements

### TR-1: NextAuth.js
- Version 4.x with JWT session strategy
- Credentials provider for email/password auth

### TR-2: Password Hashing
- bcryptjs for client-side compatibility
- Minimum cost factor of 12

### TR-3: Environment Variables
- `NEXTAUTH_SECRET` for JWT signing
- `NEXTAUTH_URL` for callback URLs

### TR-4: Database Integration
- Query User table for credential validation
- Store last login timestamp

## Role Requirements

### Admin Role
- Full access to all features
- Can manage users

### Staff Role
- Access to POS and inventory
- Cannot manage users

## Error Handling Requirements
- Invalid credentials: "Invalid email or password"
- Account not found: "Account not found, please register"
- Rate limiting: "Too many login attempts, please try again later"