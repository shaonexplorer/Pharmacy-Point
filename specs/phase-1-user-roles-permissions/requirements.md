# Phase 1: User Roles & Permissions - Requirements

## Functional Requirements

### FR-1: Role Assignment
- As an admin, I need to assign roles to users so that I can control their access levels.

### FR-2: Role-Based Access
- As a user, I need to only access features allowed for my role so that the system is secure.

### FR-3: Role Management
- As an admin, I need to view and edit user roles so that I can manage permissions.

## Non-Functional Requirements

### NFR-1: Security
- Role checks must be enforced on both client and server
- Unauthorized access attempts must be logged

### NFR-2: Performance
- Role checks should not impact page load times

## Technical Requirements

### TR-1: Role Enum
- `admin` - Full access to all features
- `staff` - Limited access to daily operations

### TR-2: Permission Structure
- Admin: createUsers, readUsers, updateUsers, deleteUsers, manageProducts, manageInventory, processSales
- Staff: manageProducts, manageInventory, processSales

### TR-3: Implementation
- Role field in User model
- Middleware for API route protection
- Higher-order component for page protection

## UI Requirements

### Role Display
- Role badges in user lists
- Role selector in user edit forms
- Visual distinction between roles

### Access Control
- Admin dashboard with user management
- Staff dashboard with POS and inventory
- Route protection for sensitive pages