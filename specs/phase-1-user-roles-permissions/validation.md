# Phase 1: User Roles & Permissions - Validation

## Acceptance Criteria

### AC-1: Role Definition
- [ ] Role enum exists in Prisma schema
- [ ] User model has role field
- [ ] Role migration applied successfully

### AC-2: Admin Access
- [ ] Admin can access user management page
- [ ] Admin can create new users
- [ ] Admin can edit existing users
- [ ] Admin can delete users

### AC-3: Staff Access
- [ ] Staff cannot access user management
- [ ] Staff can access POS interface
- [ ] Staff can manage inventory
- [ ] Staff cannot access admin settings

### AC-4: API Protection
- [ ] Admin-only API routes reject staff requests
- [ ] Role-based middleware enforces access control
- [ ] Unauthorized requests return 403 Forbidden

## Test Cases

### TC-1: Role Assignment
**Given** Admin is on user management page
**When** Admin assigns 'staff' role to a user
**Then** User's role is updated in database

### TC-2: Admin Access
**Given** User with admin role is logged in
**When** User navigates to /admin/users
**Then** Page loads successfully

### TC-3: Staff Access Denied
**Given** User with staff role is logged in
**When** User navigates to /admin/users
**Then** User receives 403 Forbidden

### TC-4: API Role Check
**Given** Staff user is logged in
**When** Staff makes DELETE request to /api/users/123
**Then** Request returns 403 Forbidden

## Validation Checklist
- [ ] Role enum in Prisma schema
- [ ] Role field in User model
- [ ] Role-based middleware
- [ ] Admin-only page protection
- [ ] Staff page access allowed
- [ ] API route role checks
- [ ] Role badge UI component
- [ ] Role selector in forms